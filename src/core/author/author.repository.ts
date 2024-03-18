import type { Author } from "@src/core/author/author.model";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { AuthorEntity } from "../schema/author.schema";
import { Pagination } from "../schema/pagination.schema";

export default interface AuthorRepository {
  list: (pagination: Pagination) => Promise<QueryResult<Author[]>>;
  getById: (
    id: number,
    pagination: Pagination,
  ) => Promise<QueryResult<AuthorEntity>>;
}
