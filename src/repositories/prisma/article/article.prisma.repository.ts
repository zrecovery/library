import { Prisma, PrismaClient } from "@prisma/client";
import { ArticleRepository } from "@src/repositories/article.repository.port";
import { StoreError } from "../StoreError";
import { Article } from "@src/model";
import {
  IArticleCreateInput,
  IArticleUpdateInput,
} from "@src/interfaces/article.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";
import { totalPaginationToPaging } from "@src/utils/totalPaginationToPaging";

export class ArticlePrismaRepository implements ArticleRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getById = async (id: number): Promise<Required<Article>> => {
    try {
      return this.#client.article.findFirstOrThrow({
        where: { id },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2001") {
          throw new StoreError(`未找到文章：article id: ${id}`);
        }
      }
      throw e;
    }
  };

  public create = async (
    created: IArticleCreateInput,
  ): Promise<Required<Article>> => {
    return this.#client.article.create({
      data: {
        ...created,
      },
    });
  };

  public update = async (
    id: number,
    updated: IArticleUpdateInput,
  ): Promise<Required<Article>> => {
    return this.#client.article.update({
      where: {
        id: id,
      },
      data: {
        ...updated,
      },
    });
  };

  public delete = async (id: number): Promise<void> => {
    try {
      await this.#client.chapter.deleteMany({
        where: {
          article_id: id,
        },
      });
      await this.#client.articles_authors.deleteMany({
        where: {
          article_id: id,
        },
      });

      await this.#client.article.delete({
        where: {
          id: id,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw e.stack;
      } else {
        throw e;
      }
    }
  };

  public list = async (
    query: Query,
  ): Promise<PaginatedResponse<Required<Article>[]>> => {
    const { limit, offset } = paginationToOffsetLimit(query);
    const { keywords } = query;
    // Todo: 目前仅识别第一个关键词，应支持多关键词搜索。
    const queryKeywords = keywords ? keywords[0] : undefined;
    const where = queryKeywords
      ? {
          body: {
            contains: queryKeywords,
          },
        }
      : undefined;

    const getArticleCount = (query?: string) => {
      if (query) {
        return this.#client.search.count({ where });
      } else {
        return this.#client.article.count();
      }
    };

    const count = await getArticleCount(queryKeywords);

    const pagination = totalPaginationToPaging(count, query);

    const ftsResult = await this.#client.search.findMany({
      select: {
        rowid: true,
      },
      where: where,
      skip: offset,
      take: limit,
    });

    const articles = await this.#client.article.findMany({
      where: {
        id: {
          in: ftsResult.map((fts) => fts.rowid),
        },
      },
    });

    const result = {
      pagination,
      detail: articles,
    };
    return result;
  };
}
