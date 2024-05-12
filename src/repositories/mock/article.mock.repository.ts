import { articlesMock } from "@src/data.mock";
import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Article } from "@src/model";
import { ArticleRepository } from "../article.repository.port";

export class ArticleMockRepository implements ArticleRepository {
  getById(
    id: number,
    query?: Record<string, string | number | string[] | undefined> | undefined,
  ): Promise<Required<Article>> {
    return Promise.resolve(articlesMock[0]);
  }
  create(created: Creatable<Article>): Promise<Required<Article>> {
    return Promise.resolve(articlesMock[0]);
  }
  update(id: number, updated: Partial<Article>): Promise<Required<Article>> {
    return Promise.resolve(articlesMock[0]);
  }
  delete(id: number): Promise<void> {
    return Promise.resolve();
  }
  list(
    query?: Query | undefined,
  ): Promise<PaginatedResponse<Required<Article>[]>> {
    const result: PaginatedResponse<Required<Article>[]> = {
      detail: articlesMock,
      pagination: {
        items: 4,
        pages: 1,
        size: 10,
        current: 1,
      },
    };
    return Promise.resolve(result);
  }
}
