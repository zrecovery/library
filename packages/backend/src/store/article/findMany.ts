import { count, like } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleList, Pagination } from "../../domain/model";
import { articles } from "../scheme";

// 获取文章列表
export const findMany =
  (db: PostgresJsDatabase) =>
  async (query: Pagination & { keyword?: string }): Promise<ArticleList> => {
    const condition = query.keyword
      ? like(articles.body, `%${query.keyword}%`)
      : undefined;

    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        body: articles.body,
      })
      .from(articles)
      .where(condition)
      .limit(query.size)
      .offset((query.page - 1) * query.size);

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
      data: result,
      pagination,
    };
  };
