import { QueryResult } from "../schema/query-result.schema";
import { Pagination } from "../schema/pagination.schema";
import type { Book } from "./book.model";

interface ArticleEntity {
  id: number;
  title: string;
  order: number;
  body: string;
  author: string;
  author_id: number;
}

interface BookEntity {
  id: number;
  title: string;
  articles: ArticleEntity[];
}


export default abstract class BookRepository {
  abstract list(pagination: Pagination): Promise<QueryResult<Book[]>>;
  abstract getById(
    id: number,
    pagination: Pagination
  ): Promise<QueryResult<BookEntity>>;
}
