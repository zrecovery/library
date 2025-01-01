import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type { ArticleDetail } from "@articles/domain/types/detail.ts";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import {
  articles,
  authors,
  chapters,
  people,
  series,
} from "@shared/infrastructure/store/schema.ts";
import type * as schema from "@shared/infrastructure/store/schema.ts";
import { Unknown } from "effect/Schema";
import { Err, Ok, type Result } from "result";
import { type FindResult, toModel } from "./dto.ts";

export const find =
  (db: PostgresJsDatabase<typeof schema>) =>
  async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundStoreError | UnknownStoreError>> => {
    try {
      const queryResult: FindResult[] = await db
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
    } catch (e) {
      return Err(new UnknownStoreError("未知错误", e));
    }
    if (queryResult.length === 0) {
      return Err(new NotFoundStoreError(`找不到文章 ${id}`));
    }

    if (queryResult.length !== 1) {
      return Err(new UnknownStoreError(`脏数据：文章id： ${id}`));
    }
    const ok = Ok(queryResult.map(toModel)[0]);
    return ok;
  };
