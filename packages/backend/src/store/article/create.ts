import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { CreateArticle } from "../../domain/model";
import { articles, authors, chapters, people, series } from "../scheme";
import { StoreError, StoreErrorType } from "../store.error";

export const create =
  (db: PostgresJsDatabase) => async (data: CreateArticle) => {
    const { title, body, author, chapter } = data;

    await db.transaction(async (trx) => {
      try {
        const articlesEntity = await trx
          .insert(articles)
          .values({ title, body })
          .returning();
        const article = articlesEntity[0];

        const result = await trx
          .select({ id: people.id })
          .from(people)
          .where(eq(people.name, author.name));
        if (result.length === 1) {
          await trx
            .insert(authors)
            .values({ person_id: result[0].id, article_id: article.id });
        }
        if (result.length === 0) {
          const peopleCreated = await trx
            .insert(people)
            .values({ name: author.name })
            .returning();
          await trx
            .insert(authors)
            .values({ person_id: peopleCreated[0].id, article_id: article.id });
        }

        if (chapter) {
          const result = await trx
            .select({ id: series.id })
            .from(series)
            .where(eq(series.title, chapter.title));
          if (result.length === 1) {
            await trx
              .insert(chapters)
              .values({
                article_id: article.id,
                series_id: result[0].id,
                order: chapter.order,
              })
              .returning();
          }
          if (result.length === 0) {
            const seriesCreated = await trx
              .insert(series)
              .values({ title: chapter.title })
              .returning();
            await trx
              .insert(chapters)
              .values({
                article_id: article.id,
                series_id: seriesCreated[0].id,
                order: chapter.order,
              })
              .returning();
          }
        }
      } catch (e) {
        try {
          trx.rollback();
        } catch {}
        throw new StoreError("创建文章失败", StoreErrorType.Other, e);
      }
    });
  };
