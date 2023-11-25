import type { Author } from "@/core/author/author.model";
import { QueryResult } from "../query-result.model";

export default interface AuthorRepository {
  getList: (limit: number, offset: number) => Promise<QueryResult<Author[]>>;
}
