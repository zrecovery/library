import { like } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleList, Pagination } from "../../domain/model";
import { articles } from "../scheme";

// 获取文章列表
export const findMany =
  (db: PostgresJsDatabase) =>
  async (query: Pagination & { keyword?: string }): Promise<ArticleList> => {
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        body: articles.body,
      })
      .from(articles)
      .where(like(articles.body, `%${query.keyword}%`))
      .limit(query.size)
      .offset((query.page - 1) * query.size);

    // get items by database count
    const items = await db
      .select()
      .from(articles)
      .where(like(articles.body, `%${query.keyword}%`));

    const pagination = {
      current: query.page,
      pages: Math.ceil(items.length / query.size),
      size: query.size,
      items: items.length,
    };

    return {
      data: result,
      pagination,
    };
  };
