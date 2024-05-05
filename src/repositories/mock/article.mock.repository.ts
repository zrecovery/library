import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Article } from "@src/model";
import { ArticleRepository } from "../article.repository.port";

export class ArticleMockRepository implements ArticleRepository {
  getById(id: number, query?: Record<string, string | number | string[] | undefined> | undefined): Promise<Required<Article>> {
    throw new Error("Method not implemented.");
  }
  create(created: Creatable<Article>): Promise<Required<Article>> {
    throw new Error("Method not implemented.");
  }
  update(id: number, updated: Partial<Article>): Promise<Required<Article>> {
    throw new Error("Method not implemented.");
  }
  delete(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  list(query?: Query | undefined): Promise<PaginatedResponse<Required<Article>[]>> {
    throw new Error("Method not implemented.");
  }
  
}
