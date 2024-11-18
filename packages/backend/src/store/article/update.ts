import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Id } from "../../domain/model";
import { articles, authors, chapters, people, series } from "../scheme";
import { StoreError, StoreErrorType } from "../store.error.ts";

export const update =
  (db: PostgresJsDatabase) =>
  async (
    id: Id,
    data: {
      title?: string;
      body?: string;
      author?: Partial<{ name: string }>;
      chapter?: Partial<{ title: string; order: number }>;
    },
  ) => {
    const { title, body, author, chapter } = data;
    const article = (
      await db
        .select()
        .from(articles)
        .leftJoin(authors, eq(authors.article_id, articles.id))
        .leftJoin(people, eq(authors.person_id, people.id))
        .leftJoin(chapters, eq(chapters.article_id, articles.id))
        .leftJoin(series, eq(chapters.series_id, series.id))
        .where(eq(articles.id, id))
    )[0];

    await db.transaction(async (trx) => {
      try {
        if (title || body) {
          await trx
            .update(articles)
            .set({ title, body })
            .where(eq(articles.id, id));
        }

        if (author) {
          if (author.name) {
            const query = await trx
              .select({ id: people.id })
              .from(people)
              .where(eq(people.name, author.name));

            const isExistedNewAuthor = query.length === 1;
            if (!article.authors) {
              throw new StoreError(
                "脏数据：未查找到关联作者",
                StoreErrorType.ValidationError,
              );
            }
            const isExistedRelation = article.authors.id !== null;

            if (isExistedNewAuthor && isExistedRelation) {
              const a = query[0];
              await trx
                .update(authors)
                .set({ person_id: a.id })
                .where(eq(authors.id, article.authors?.id));
            }

            if (!isExistedNewAuthor && isExistedRelation) {
              const person = await trx
                .insert(people)
                .values({ name: author.name })
                .returning();
              await trx
                .update(authors)
                .set({ person_id: person[0].id })
                .where(eq(authors.id, article.authors.id));
            }

            if (isExistedNewAuthor && !isExistedRelation) {
              const a = query[0];
              await trx
                .insert(authors)
                .values({ person_id: a.id, article_id: id });
            }

            if (!isExistedNewAuthor && !isExistedRelation) {
              const person = await trx
                .insert(people)
                .values({ name: author.name })
                .returning();
              await trx
                .insert(authors)
                .values({ person_id: person[0].id, article_id: id });
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
        }
      } catch (e) {
        trx.rollback();
        throw e;
      }
    });
  };
