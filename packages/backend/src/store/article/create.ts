import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleCreate, Id } from "../../domain/model";
import { articles, authors } from "../scheme";
import { StoreError, StoreErrorType } from "../store.error";
import { seriesBaseStore } from "../base/series";
import { chaptersBaseStore } from "../base/chapter";
import { personBaseStore } from "../base/person";

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
  
        const person = await personBaseStore.findOrCreate(trx)(author);
          await trx
            .insert(authors)
            .values({ person_id: person.id, article_id: article.id });

        if (chapter) {
          const result = await seriesBaseStore.findOrCreate(trx)(chapter)
            await  chaptersBaseStore.create(trx)({
                article_id: article.id,
                series_id: result.id,
                order: chapter.order,
              });
        }
      } catch (e) {
        try {
          trx.rollback();
        } catch {}
        throw new StoreError("创建文章失败", StoreErrorType.Other, e);
      }
    });
  };
