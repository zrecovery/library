import type { Author } from "@src/core/author/author.model";
import type AuthorRepository from "@src/core/author/author.repository";
import type { AuthorEntity } from "@src/core/schema/author.schema";
import { Pagination } from "@src/core/schema/pagination.schema";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { paginationToEntity } from "@src/utils/pagination.util";
import type { PrismaClient } from "@prisma/client";


export class AuthorPrismaRepository implements AuthorRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public list = async (
    pagination: Pagination
  ): Promise<QueryResult<Author[]>> => {
    const { offset, limit } = paginationToEntity(pagination);

    const count = await this.#client.author.count();
    const total = Math.ceil(count / limit);
    const authors = await this.#client.author.findMany({
      skip: offset,
      take: limit,
    });
    const result: QueryResult<Author[]> = {
      message: "success",
      data: {
        paging: {
          size: limit,
          page: Math.ceil(offset / limit),
          total: total
        },
        detail: authors,
      }
    };
    return result;
  };

  getById = async (id: number, pagination: Pagination): Promise<QueryResult<AuthorEntity>> => {
    const { offset, limit } = paginationToEntity(pagination);
    const author = await this.#client.author.findFirstOrThrow({
      select: {
        id: true,
        name: true
      },
      where: {
        id
      }
    });

    const count = await this.#client.book.count({
      where: {
        author_id: id
      }
    })

    const books = await this.#client.book.findMany({
      select: {
        id: true,
        title: true
      },
      where: {
        author_id: id
      },
      skip: offset,
      take: limit,
    });

    const total = Math.ceil(count / limit);

    return {
      message: "success",
      data: {
        paging: {
          total,
          page: pagination.page,
          size: limit
        },
        detail: {
          id: id,
          name: author.name,
          books: books
        }
      }
    }

  }
}
