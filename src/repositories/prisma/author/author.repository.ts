import type { PrismaClient } from "@prisma/client";
import { AuthorRepository } from "@src/repositories/author.repository.port";
import { Author } from "@src/model";
import { Creatable, Updatable } from "@src/interfaces/common.interface";
import { PaginatedResponse } from "@src/interfaces/response.interface";

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

  async create(created: Creatable<Author>): Promise<Author> {
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
    query?: Record<string, any>,
  ): Promise<PaginatedResponse<Required<Author>[]>> {
    const [items, total] = await this.#client.author.findMany({
      select: { ...query?.select },
      skip: query?.pagination?.page * query?.pagination?.limit,
      take: query?.pagination?.limit,
      orderBy: { created_at: "desc" },
    });

    const result:PaginatedResponse<Required<Author>[]> = {
    
      detail: items,
      pagination: {
        page: query?.pagination?.page,
        limit: query?.pagination?.limit,
        total: total.length,
      },
    };

    
  }
}
