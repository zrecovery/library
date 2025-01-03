import {
  articles,
  authors,
  chapters,
  people,
  series,
} from "@shared/infrastructure/store/schema.ts";
import { count, eq, like } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { type MetaResult, toModel } from "./dto.ts";

import type { ArticleListResponse } from "@articles/domain/types/list.ts";
import type { Pagination } from "@shared/domain/types/common";
import type * as schema from "@shared/infrastructure/store/schema.ts";

// 获取文章列表
export const findMany =
  (db: PostgresJsDatabase<typeof schema>) =>
  async (
    query: Pagination & { keyword?: string },
  ): Promise<ArticleListResponse> => {
    try {
      const condition = query.keyword
        ? like(articles.body, `%${query.keyword}%`)
        : undefined;

      const result: MetaResult[] = await db
        .select({
          article: {
            id: articles.id,
            title: articles.title,
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
        .where(condition)
        .orderBy(people.id, series.id, chapters.order)
        .limit(query.size)
        .offset((query.page - 1) * query.size);

      const list = result.map(toModel);

      // get items by database count
      const items = await db
        .select({ value: count(articles.id) })
        .from(articles)
        .where(condition);

      const pagination = {
        current: query.page,
        pages: Math.ceil(items[0].value / query.size),
        size: query.size,
        items: items.length,
      };

      return {
        data: list,
        pagination,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
