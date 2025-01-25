import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type { Finder } from "@articles/domain/interfaces/store/finder.ts";
import type { ArticleDetail } from "@articles/domain/types/detail.ts";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import { libraryView } from "@shared/infrastructure/store/schema.ts";
import type * as schema from "@shared/infrastructure/store/schema.ts";
import { Err, Ok, type Result } from "result";
import { type FindResult, toModel } from "./dto.ts";

export class DrizzleFinder implements Finder {
  readonly #db: PostgresJsDatabase<typeof schema>;
  constructor(readonly db: PostgresJsDatabase<typeof schema>) {
    this.#db = db;
  }

  find = async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundStoreError | UnknownStoreError>> => {
    try {
      const queryResult: FindResult[] = await this.#db
        .select({
          article: {
            id: libraryView.id,
            title: libraryView.title,
            body: libraryView.body,
          },
          author: {
            id: libraryView.people_id,
            name: libraryView.people_name,
          },
          chapter: {
            id: libraryView.series_id,
            title: libraryView.series_title,
            order: libraryView.chapter_order,
          },
        })
        .from(libraryView)
        .where(eq(libraryView.id, id));

      if (queryResult.length === 0) {
        return Err(new NotFoundStoreError(`找不到文章 ${id}`));
      }

      if (queryResult.length !== 1) {
        return Err(new UnknownStoreError(`脏数据：文章id： ${id}`));
      }

      const articleDetail = queryResult.map(toModel)[0];
      return Ok(articleDetail);
    } catch (e) {
      return Err(
        e instanceof Error
          ? new UnknownStoreError("未知错误", e)
          : new UnknownStoreError(`未知错误，无法确认捕获类型：${e}`),
      );
    }
  };
}
