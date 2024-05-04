import type { PrismaClient } from "@prisma/client";
import { AuthorRepository } from "@src/repositories/author.repository.port";
import { Author } from "@src/model";
import { Creatable, Updatable } from "@src/interfaces/common.interface";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Query } from "@src/interfaces/query";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";

export class AuthorPrismaRepository implements AuthorRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }
  async getById(id: number): Promise<Required<Author>> {
    return this.#client.author.findFirstOrThrow({
      where: { id },
    });
  }

  async create(created: Creatable<Author>): Promise<Required<Author>> {
    return this.#client.author.create({
      data: { ...created },
    });
  }

  async update(id: number, updated: Updatable<Author>): Promise<Required<Author>> {
    return this.#client.author.update({
      where: { id },
      data: { ...updated },
    });
  }

  async delete(id: number): Promise<void> {
    await this.#client.author.delete({
      where: { id },
    });
  }

  async list(
    query: Query,
  ): Promise<PaginatedResponse<Required<Author>[]>> {
    const { page, size } = query;
    const { limit, offset } = paginationToOffsetLimit({ page, size });
    const canQueryKey = ["name"];
    const where = canQueryKey.reduce((prev, key) => query[key] ? { ...prev, [key]: query[key] } : prev, {});

    const [authors, total] = await this.#client.$transaction([
      this.#client.author.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          id: "asc",
        },
      }),
      this.#client.author.count(),
    ]);
    return {
      detail: authors,
      pagination: {
        pages: Math.ceil(total / (size ?? 10)),
        items: total,
        current: page ?? 1,
        size: size ?? 10,
      },
    };
  }

}
