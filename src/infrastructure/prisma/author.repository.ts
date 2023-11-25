import type { Author } from "@/core/author/author.model";
import type AuthorRepository from "@/core/author/author.repository";
import { QueryResult } from "@/core/query-result.model";
import type { PrismaClient } from "@prisma/client";

export class AuthorPrismaRepository implements AuthorRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getList = async (
    limit: number,
    offset: number,
  ): Promise<QueryResult<Author[]>> => {
    const total = await this.#client.author.count();
    const authors = await this.#client.author.findMany({
      skip: offset,
      take: limit,
    });
    const result: QueryResult<Author[]> = {
      page: Math.ceil(total / limit),
      size: limit,
      current_page: Math.ceil(offset / limit),
      detail: authors,
    };
    return result;
  };
}
