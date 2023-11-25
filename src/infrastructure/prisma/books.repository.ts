import { config } from "@/application/configure";
import type { Article } from "@/core/article/article.model";
import type { Book } from "@/core/book/book.model";
import type BookRepository from "@/core/book/book.repository";
import { QueryResult } from "@/core/query-result.model";
import type { PrismaClient } from "@prisma/client";

export class BookPrismaRepository implements BookRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getBooksByAuthorId = async (
    id: number,
    limit: number = config.LIMIT,
    offset = 0,
  ): Promise<QueryResult<Book[]>> => {
    const total = await this.#client.book.count({
      where: {
        author_id: id,
      },
    });
    const books = await this.#client.book
      .findMany({
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
      })
      .then((books) =>
        books.map((book): Book => {
          return {
            id: book.id,
            title: book.title,
            author: book.author.name,
          };
        }),
      );
    const result: QueryResult<Book[]> = {
      page: Math.ceil(total / limit),
      size: limit,
      current_page: Math.ceil(offset / limit),
      detail: books,
    };
    return result;
  };

  public getBookById = async (
    id: number,
    limit: number,
    offset: number,
  ): Promise<QueryResult<Article[]>> => {
    const total = await this.#client.chapter.count({
      where: {
        book_id: id,
      },
    });
    const articles = await this.#client.chapter
      .findMany({
        select: {
          chapter_order: true,
          article: {
            select: {
              id: true,
              title: true,
              body: true,
              love: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          book: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        where: {
          book_id: id,
        },
        orderBy: {
          chapter_order: "asc",
        },
        skip: offset,
        take: limit,
      })
      .then((chapters) =>
        chapters.map((chapter): Article => {
          return {
            id: chapter.article.id,
            title: chapter.article.title,
            book: chapter.book.title,
            author: chapter.article.author.name,
            chapter_order: chapter.chapter_order,
            body: chapter.article.body,
            love: chapter.article.love,
          };
        }),
      );
    const result: QueryResult<Article[]> = {
      page: Math.ceil(total / limit),
      size: limit,
      current_page: Math.ceil(offset / limit),
      detail: articles,
    };
    return result;
  };

  public getList = async (
    limit: number = config.LIMIT,
    offset = 0,
  ): Promise<QueryResult<Book[]>> => {
    const total = await this.#client.book.count();
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
    const result: QueryResult<Book[]> = {
      page: Math.ceil(total / limit),
      size: limit,
      current_page: Math.ceil(offset / limit),
      detail: books,
    };
    return result;
  };
}
