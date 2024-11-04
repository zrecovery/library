import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleCreate } from "../../domain/model";
import { articles, authors, chapters, people, series } from "../scheme";
import { StoreError, StoreErrorType } from "../store.error";

export const create =
  (db: PostgresJsDatabase) => async (data: ArticleCreate) => {
    const { title, body, author, chapter } = data;

    await db.transaction(async (trx) => {
      try {
        const articlesEntity = await trx
          .insert(articles)
          .values({ title, body })
          .returning();
        const article = articlesEntity[0];

        await trx
          .insert(people)
          .values({ name: author.name })
          .onConflictDoNothing({ target: people.name });

        const [person] = await trx
          .select({ id: people.id, name: people.name })
          .from(people)
          .where(eq(people.name, author.name));

        await trx
          .insert(authors)
          .values({ person_id: person.id, article_id: article.id });

        if (chapter) {
          await trx
            .insert(series)
            .values({ title: chapter.title })
            .onConflictDoNothing({ target: series.title });

          const [s] = await trx
            .select({ id: series.id, title: series.title })
            .from(series)
            .where(eq(series.title, chapter.title));

          await trx.insert(chapters).values({
            article_id: article.id,
            series_id: s.id,
            order: chapter.order,
          });
        }
      } catch (e) {
        try {
          trx.rollback();
        } catch {}
        console.error(e);
        throw new StoreError("创建文章失败", StoreErrorType.Other, e);
      }
    });
  };
