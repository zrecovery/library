import { Pagination } from "../schema/pagination.schema";
import { QueryResult } from "../schema/query-result.schema";
import {
  ArticleCreated,
  ArticleEntity,
  ArticleUpdated,
} from "./article.schema";

export interface Query {
  love?: boolean;
  keyword?: string;
}

export abstract class ArticleRepository {
  abstract getById(id: number): Promise<QueryResult<ArticleEntity>>;
  abstract create(article: ArticleCreated): Promise<void>;
  abstract update(article: ArticleUpdated): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract search(
    query: Query,
    pagination: Pagination,
  ): Promise<QueryResult<ArticleEntity[]>>;
}
