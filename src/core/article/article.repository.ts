import { Pagination } from "../schema/pagination.schema";
import { QueryResult } from "../schema/query-result.schema";
import type { Article } from "./article.model";

export interface Query {
  love?: boolean;
  keyword?: string;
}

export abstract class ArticleRepository {
  abstract getById(id: number): Promise<QueryResult<Article>>;
  abstract create(article: Article): Promise<void>;
  abstract update(article: Article): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract search(
    query: Query,
    pagination: Pagination
  ): Promise<QueryResult<Article[]>>;
}
