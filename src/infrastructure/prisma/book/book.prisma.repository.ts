import type { Book } from "@src/core/book/book.model";
import type BookRepository from "@src/core/book/book.repository";
import type { PrismaClient } from "@prisma/client";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { Pagination } from "@src/core/schema/pagination.schema";
import { ArticleEntity, BookEntity } from "@src/core/book/book.repository";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";

export class BookPrismaRepository implements BookRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }
  public getById = async (
    id: number,
    pagination: Pagination,
  ): Promise<QueryResult<BookEntity>> => {
    const { limit, offset } = paginationToOffsetLimit(pagination);

    const total = await this.#client.chapter.count({
      where: {
        book_id: id,
      },
    });
    const book = await this.#client.book.findFirst({
      where: {
        id,
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
        chapters.map((chapter): ArticleEntity => {
          return {
            id: chapter.article.id,
            title: chapter.article.title,
            author: chapter.article.author.name,
            author_id: chapter.article.author.id,
            order: chapter.chapter_order,
            body: chapter.article.body,
          };
        }),
      );

    const result: QueryResult<BookEntity> = {
      paging: {
        total: Math.ceil(total / limit),
        size: limit,
        page: Math.ceil(offset / limit) + 1,
      },
      detail: {
        id: book!.id,
        title: book!.title,
        articles: articles,
      },
    };
    return result;
  };

  public list = async (
    pagination: Pagination,
  ): Promise<QueryResult<Book[]>> => {
    const { limit, offset } = paginationToOffsetLimit(pagination);
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
      paging: {
        total: Math.ceil(total / limit),
        size: limit,
        page: Math.ceil(offset / limit) + 1,
      },
      detail: books,
    };
    return result;
  };
}
