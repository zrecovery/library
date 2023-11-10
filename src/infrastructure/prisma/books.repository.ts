import type { Article } from "@/core/article/model/article.model";
import type { Book } from "@/core/book/model/book.model";
import type BookRepository from "@/core/book/repostory/BookRepository";
import type { PrismaClient } from "@prisma/client";

const LIMIT = 20;

export class BookPrismaRepository implements BookRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getBooksByAuthorId = async (
    id: number,
    limit: number = LIMIT,
    offset = 0,
  ): Promise<Book[]> => {
    const res = await this.#client.book.findMany({
      select: {
        id: true,
        title: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      where: {
        author_id: id,
      },
      skip: offset,
      take: limit,
    });
    const books = res.flatMap((b) => {
      return { id: b.id, title: b.title, author: b.author.name };
    });

    return books;
  };

  public getBookById = async (
    id: number,
    limit?: number | undefined,
    offset?: number | undefined,
  ): Promise<Article[]> => {
    return this.#client.articles_view_shadow.findMany({
      select: {
        id: true,
        title: true,
        book: true,
        author: true,
        chapter_order: true,
        body: true,
        love: true,
      },
      where: {
        book_id: id,
      },
      orderBy: {
        chapter_order: "asc",
      },
      skip: offset,
      take: limit,
    });
  };

  public getList = async (
    limit: number = LIMIT,
    offset = 0,
  ): Promise<Book[]> => {
    const res = await this.#client.book.findMany({
      select: {
        id: true,
        title: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      skip: offset,
      take: limit,
    });
    const books = res.flatMap((b) => {
      return { id: b.id, title: b.title, author: b.author.name };
    });

    return books;
  };
}
