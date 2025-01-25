import type { Updater } from "@articles/domain";
import { type Id, UnknownError } from "@shared/domain";
import {
  NotFoundStoreError,
  StoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import {
  articles,
  authors,
  chapters,
  libraryView,
  people,
  series,
} from "@shared/infrastructure/store/schema.ts";
import type * as schema from "@shared/infrastructure/store/schema.ts";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Err, Ok, type Result } from "result";

type viewResult = {
  id: number;
  title: string;
  series_id: number | null;
  chapter_id: number | null;
  chapter_order: number | null;
  series_title: string | null;
  author_id: number | null;
  people_id: number | null;
  people_name: string | null;
};

export class DrizzleUpdater implements Updater {
  readonly #db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.#db = db;
  }

  #updateAuthorRelated =
    (trx: PostgresJsDatabase<typeof schema>) =>
    async (viewResult: viewResult, author: { name: string }) => {
      const query = await trx
        .select({ id: people.id })
        .from(people)
        .where(eq(people.name, author.name));

      const isExistedNewAuthor = query.length === 1;
      if (!viewResult.author_id) {
        throw new UnknownStoreError("脏数据：未查找到关联作者");
      }
      const isExistedRelation = viewResult.author_id !== null;

      if (isExistedNewAuthor && isExistedRelation) {
        const a = query[0];
        await trx
          .update(authors)
          .set({ person_id: a.id })
          .where(eq(authors.id, viewResult.author_id));
      }

      // article存在已有作者关系，但待新增author不存在people表中
      if (!isExistedNewAuthor && isExistedRelation) {
        const person = await trx
          .insert(people)
          .values({ name: author.name })
          .returning();
        await trx
          .update(authors)
          .set({ person_id: person[0].id })
          .where(eq(authors.id, viewResult.author_id));
      }

      if (isExistedNewAuthor && !isExistedRelation) {
        const a = query[0];
        await trx
          .insert(authors)
          .values({ person_id: a.id, article_id: viewResult.id });
      }

      if (!isExistedNewAuthor && !isExistedRelation) {
        const person = await trx
          .insert(people)
          .values({ name: author.name })
          .returning();
        await trx
          .insert(authors)
          .values({ person_id: person[0].id, article_id: viewResult.id });
      }
    };

  update = async (
    id: Id,
    data: {
      title?: string;
      body?: string;
      author?: Partial<{ name: string }>;
      chapter?: Partial<{ title: string; order: number }>;
    },
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>> => {
    const { title, body, author, chapter } = data;
    await this.#db.transaction(async (trx) => {
      try {
        const article = (
          await trx.select().from(libraryView).where(eq(libraryView.id, id))
        )[0];
        if (title || body) {
          await trx
            .update(articles)
            .set({ title, body })
            .where(eq(articles.id, id));
        }

        if (author) {
          if (author.name) {
            const name = author.name;
            await this.#updateAuthorRelated(trx)(article, { name });
          }
        }

        if (chapter) {
          const relation = await trx
            .select({ id: chapters.id })
            .from(chapters)
            .where(eq(chapters.article_id, id));
          if (chapter.title) {
            const query = await trx
              .select({ id: series.id })
              .from(series)
              .where(eq(series.title, chapter.title));
            if (query.length === 1 && relation.length === 1) {
              await trx
                .update(chapters)
                .set({ series_id: query[0].id })
                .where(eq(chapters.article_id, id));
            }
            if (query.length === 0 && relation.length === 1) {
              const created = await trx
                .insert(series)
                .values({ title: chapter.title })
                .returning();
              await trx
                .update(chapters)
                .set({ series_id: created[0].id })
                .where(eq(chapters.article_id, id));
            }
            if (query.length === 1 && relation.length === 0) {
              await trx
                .insert(chapters)
                .values({
                  article_id: id,
                  series_id: query[0].id,
                  order: chapter.order,
                })
                .returning();
            }
            if (query.length === 0 && relation.length === 0) {
              const created = await trx
                .insert(series)
                .values({ title: chapter.title })
                .returning();
              await trx
                .insert(chapters)
                .values({
                  article_id: id,
                  series_id: created[0].id,
                  order: chapter.order,
                })
                .returning();
            }
          }
          if (chapter.order) {
            await trx
              .update(chapters)
              .set({ order: chapter.order })
              .where(eq(chapters.article_id, id));
          }
        }
      } catch (e) {
        trx.rollback();
        if (e instanceof StoreError) {
          return Err(new NotFoundStoreError(e.message));
        }
        return Err(new UnknownError(`${e}`));
      }
    });
    return Ok(null);
  };
}
