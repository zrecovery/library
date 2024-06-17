import { Prisma, type PrismaClient } from "@prisma/client";
import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { ArticleAuthorRelationship } from "@src/model";
import type { ArticleAuthorRelationshipRepository } from "@src/repositories/author.repository.port";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";
import { ErrorType, StoreError } from "../StoreError";

export class ArticlesAuthorsRelationPrismaRepository
  implements ArticleAuthorRelationshipRepository
{
  #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  getById(id: number): Promise<Required<ArticleAuthorRelationship>> {
    try {
      return this.#client.articles_authors.findFirstOrThrow({ where: { id } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2001") {
          throw new StoreError(
            ErrorType.NotFound,
            `未找到作者文章关联：article id: ${id}`,
          );
        }
      }
      throw e;
    }
  }

  create(
    created: Creatable<ArticleAuthorRelationship>,
  ): Promise<Required<ArticleAuthorRelationship>> {
    return this.#client.articles_authors.create({ data: { ...created } });
  }

  update(
    id: number,
    updated: Partial<ArticleAuthorRelationship>,
  ): Promise<Required<ArticleAuthorRelationship>> {
    return this.#client.articles_authors.update({
      where: { id },
      data: { ...updated },
    });
  }

  delete = async (id: number): Promise<void> => {
    await this.#client.articles_authors.delete({ where: { id } });
  };

  list = async (
    query: Query,
  ): Promise<PaginatedResponse<Required<ArticleAuthorRelationship>[]>> => {
    const { page, size } = query;
    const { limit, offset } = paginationToOffsetLimit({ page, size });

    const canQueryKey = ["article_id", "author_id"];
    const where = canQueryKey.reduce(
      (
        prev: { [key: string]: string | number | string[] | undefined },
        key: string,
      ) => {
        if (query[key]) {
          prev[key] = query[key];
        }
        return prev;
      },
      {},
    );

    const count = await this.#client.articles_authors.count({
      where: where,
    });

    const authorsArticlesRelationship =
      await this.#client.articles_authors.findMany({
        where: where,
        skip: offset,
        take: limit,
      });

    return {
      detail: authorsArticlesRelationship,
      pagination: {
        pages: Math.ceil(count / (size ?? 10)),
        items: count,
        current: page ?? 1,
        size: size ?? 10,
      },
    };
  };
}
