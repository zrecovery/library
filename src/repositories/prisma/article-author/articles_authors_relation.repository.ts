import { Prisma, PrismaClient } from "@prisma/client";
import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { ArticleAuthorRelationship } from "@src/model";
import { ArticleAuthorRelationshipRepository } from "@src/repositories/author.repository.port";
import { StoreError } from "../StoreError";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";

export class ArticleSAuthorsRelationPrismaRepository
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
          throw new StoreError(`未找到作者文章关联：article id: ${id}`);
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
      (prev, key) => (query[key] ? { ...prev, [key]: query[key] } : prev),
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
