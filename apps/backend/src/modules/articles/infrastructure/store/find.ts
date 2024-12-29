import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type { ArticleDetail } from "@articles/domain/types/detail.ts";
import {
  type NotFoundStoreError,
  StoreError,
  StoreErrorType,
  type UnknownStoreError,
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
import  { type Effect, gen} from "effect/Effect";
import { type FindResult, toModel } from "./dto.ts";

export const find =
  (db: PostgresJsDatabase<typeof schema>) =>
  (id: Id): Effect<ArticleDetail, NotFoundStoreError | UnknownStoreError> => {
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
    });

    if (result.length === 0) {
      return null;
    }

    if (result.length !== 1) {
      throw new StoreError("内部存在脏数据", StoreErrorType.NotFound);
    }

    return result.map(toModel)[0];
  };
