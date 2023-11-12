import type { Book } from "./book.model";
import type { Article } from "@/core/article/article.model";

export default abstract class BookRepository {
  abstract getList(limit: number, offset: number): Promise<Book[]>;
  abstract getBookById(
    id: number,
    limit: number,
    offset: number,
  ): Promise<Article[]>;
  abstract getBooksByAuthorId(
    authorId: number,
    limit: number,
    offset: number,
  ): Promise<Book[]>;
}