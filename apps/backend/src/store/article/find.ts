import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleDetail, Id } from "../../domain/model";

import { type FindResult, toModel } from "../dto.ts";
import { articles, authors, chapters, people, series } from "../scheme";
import { StoreError, StoreErrorType } from "../store.error";

export const find =
  (db: PostgresJsDatabase) =>
  async (id: Id): Promise<ArticleDetail | null> => {
    const result: FindResult[] = await db
      .select({
        article: {
          id: articles.id,
          title: articles.title,
          body: articles.body,
        },
        author: {
          id: people.id,
          name: people.name,
        },
        chapter: {
          id: series.id,
          title: series.title,
          order: chapters.order,
        },
      })
      .from(articles)
      .leftJoin(authors, eq(authors.article_id, articles.id))
      .leftJoin(people, eq(authors.person_id, people.id))
      .leftJoin(chapters, eq(chapters.article_id, articles.id))
      .leftJoin(series, eq(chapters.series_id, series.id))
      .where(eq(articles.id, id));

    if (result.length === 0) {
      return null;
    }

    if (result.length !== 1) {
      throw new StoreError("内部存在脏数据", StoreErrorType.NotFound);
    }

    return result.map(toModel)[0];
  };
