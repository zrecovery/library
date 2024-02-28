import type { Article } from "@src/core/article/article.model";
import type BookService from "@src/core/book/book.service";
import type { Book } from "@src/core/book/book.model";
import type { Context } from "elysia";
import { pagination } from "@src/utils/pagination.util";

export class BookController {
  constructor(readonly bookService: BookService) {}

  public list = async ({ query }: Context): Promise<Book[]> => {
    const { page, size } = query;
    const { limit, offset } = pagination(page, size);
    return await this.bookService.getList(limit, offset);
  };

  public getById = async ({
    query,
    params: { id },
  }: Context<{ params: { id: string } }>): Promise<Article[]> => {
    const { page, size } = query;
    const { limit, offset } = pagination(page, size);
    return await this.bookService.getBookById(Number(id), limit, offset);
  };

  public getByAuthorId = async ({
    query,
    params: { id },
  }: Context<{ params: { id: string } }>): Promise<Book[]> => {
    const { page, size } = query;
    const { limit, offset } = pagination(page, size);
    return await this.bookService.getBooksByAuthorId(Number(id), limit, offset);
  };
}
