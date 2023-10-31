import type { Article } from "../article/model/article.model";
import type { Book } from "./model/book.model";
import type BookRepository from "./repostory/BookRepository";

export default class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  async getList(limit: number, offset: number): Promise<Book[]> {
    return await this.bookRepository.getList(limit, offset);
  }

  async getBookById(
    id: number,
    limit: number,
    offset: number,
  ): Promise<Article[]> {
    return await this.bookRepository.getBookById(id, limit, offset);
  }

  async getBooksByAuthorId(
    authorId: number,
    limit: number,
    offset: number,
  ): Promise<Book[]> {
    return await this.bookRepository.getBooksByAuthorId(
      authorId,
      limit,
      offset,
    );
  }
}
