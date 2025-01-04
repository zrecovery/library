import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import type { Id } from "@shared/domain";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error";
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
import { Err, Ok, type Result } from "result";

export class DrizzleSaver implements Saver {
  readonly #db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.#db = db;
  }

  #createArticle =
    (trx: PostgresJsDatabase<typeof schema>) =>
    async (data: { title: string; body: string }) => {
      const articlesEntity = await trx
        .insert(articles)
        .values({ title: data.title.trim(), body: data.body.trim() })
        .returning();

      if (articlesEntity.length !== 1) {
        throw new UnknownStoreError("未能成功创建：返回值列表长度不为1");
      }

      return articlesEntity[0];
    };

  #handleAuthor =
    (trx: PostgresJsDatabase<typeof schema>) =>
    async (articleId: Id, author: { name: string }) => {
      await trx
        .insert(people)
        .values({ name: author.name.trim() })
        .onConflictDoNothing({ target: people.name });

      const [person] = await trx
        .select({ id: people.id, name: people.name })
        .from(people)
        .where(eq(people.name, author.name.trim()));

      if (!person) {
        throw new UnknownStoreError(
          `Failed to create and find people: ${author.name}`,
        );
      }
      try {
        await trx
          .insert(authors)
          .values({ person_id: person.id, article_id: articleId });
      } catch (e) {
        throw new UnknownStoreError(
          `Failed to create author: ${author.name}, articleId: ${articleId}, RawError: ${e}`,
        );
      }
    };

  #handleChapter =
    (trx: PostgresJsDatabase<typeof schema>) =>
    async (articleId: Id, chapter: { title: string; order?: number }) => {
      await trx
        .insert(series)
        .values({ title: chapter.title.trim() })
        .onConflictDoNothing({ target: series.title });

      const [s] = await trx
        .select({ id: series.id, title: series.title })
        .from(series)
        .where(eq(series.title, chapter.title.trim()));

      if (!s) {
        throw new UnknownStoreError(
          `Failed to create and find series: ${chapter.title}`,
        );
      }

      await trx.insert(chapters).values({
        article_id: articleId,
        series_id: s.id,
        order: chapter.order ?? 1.0,
      });
    };

  save = async (
    data: ArticleCreate,
  ): Promise<Result<null, UnknownStoreError>> => {
    const { title, body, author, chapter } = data;

    await this.#db.transaction(async (trx) => {
      try {
        // Create article
        const article = await this.#createArticle(trx)({ title, body });

        const author_handled = await this.#handleAuthor(trx)(
          article.id,
          author,
        );

        // Handle chapter if provided
        if (chapter) {
          await this.#handleChapter(trx)(article.id, chapter);
        }
      } catch (e) {
        trx.rollback();
        if (e instanceof Error) {
          return Err(new UnknownStoreError("Failed to create article", e));
        }
        return Err(
          new UnknownStoreError(
            `Failed to create article, and can not parse error. ${e}`,
          ),
        );
      }
    });
    return Ok(null);
  };
}
