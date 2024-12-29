import type { ArticleCreate } from "@articles/domain/types/create";
import {
  StoreError,
  StoreErrorType,
} from "@shared/domain/interfaces/store.error";
import {
  articles,
  authors,
  chapters,
  people,
  series,
} from "@shared/infrastructure/store/schema";
import type * as schema from "@shared/infrastructure/store/schema";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const save =
  (db: PostgresJsDatabase<typeof schema>) => async (data: ArticleCreate) => {
    // Input validation
    if (!data.title?.trim()) {
      throw new StoreError(
        "Article title is required",
        StoreErrorType.ValidationError,
        null,
        { field: "title" },
      );
    }

    if (!data.body?.trim()) {
      throw new StoreError(
        "Article body is required",
        StoreErrorType.ValidationError,
        null,
        { field: "body" },
      );
    }

    if (!data.author?.name?.trim()) {
      throw new StoreError(
        "Author name is required",
        StoreErrorType.ValidationError,
        null,
        { field: "author.name" },
      );
    }

    const { title, body, author, chapter } = data;

    await db.transaction(async (trx) => {
      try {
        // Create article
        const articlesEntity = await trx
          .insert(articles)
          .values({ title: title.trim(), body: body.trim() })
          .returning();

        if (!articlesEntity.length) {
          throw new StoreError(
            "Failed to create article",
            StoreErrorType.DatabaseError,
          );
        }

        const article = articlesEntity[0];

        // Handle author
        await trx
          .insert(people)
          .values({ name: author.name.trim() })
          .onConflictDoNothing({ target: people.name });

        const [person] = await trx
          .select({ id: people.id, name: people.name })
          .from(people)
          .where(eq(people.name, author.name.trim()));

        if (!person) {
          throw new StoreError(
            "Failed to create or find author",
            StoreErrorType.DatabaseError,
            null,
            { authorName: author.name },
          );
        }

        await trx
          .insert(authors)
          .values({ person_id: person.id, article_id: article.id });

        // Handle chapter if provided
        if (chapter) {
          if (!chapter.title?.trim()) {
            throw new StoreError(
              "Chapter title is required when chapter is provided",
              StoreErrorType.ValidationError,
              null,
              { field: "chapter.title" },
            );
          }

          await trx
            .insert(series)
            .values({ title: chapter.title.trim() })
            .onConflictDoNothing({ target: series.title });

          const [s] = await trx
            .select({ id: series.id, title: series.title })
            .from(series)
            .where(eq(series.title, chapter.title.trim()));

          if (!s) {
            throw new StoreError(
              "Failed to create or find series",
              StoreErrorType.DatabaseError,
              null,
              { chapterTitle: chapter.title },
            );
          }

          await trx.insert(chapters).values({
            article_id: article.id,
            series_id: s.id,
            order: chapter.order ?? 1.0,
          });
        }
      } catch (e) {
        await trx.rollback();
        if (e instanceof StoreError) {
          throw e;
        }
        throw new StoreError(
          "Failed to create article",
          StoreErrorType.UnknownError,
          e,
        );
      }
    });
  };
