import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { ArticleAuthorRelationship } from "@src/model";
import { ArticleAuthorRelationshipRepository } from "../author.repository.port";

export class ArticleAuthorRelationshipMockRepository
  implements ArticleAuthorRelationshipRepository
{
  getById(
    id: number,
    query?: Record<string, string | number | string[] | undefined> | undefined,
  ): Promise<Required<ArticleAuthorRelationship>> {
    throw new Error("Method not implemented.");
  }
  create(
    created: Creatable<ArticleAuthorRelationship>,
  ): Promise<Required<ArticleAuthorRelationship>> {
    throw new Error("Method not implemented.");
  }
  update(
    id: number,
    updated: Partial<ArticleAuthorRelationship>,
  ): Promise<Required<ArticleAuthorRelationship>> {
    throw new Error("Method not implemented.");
  }
  delete(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  list(
    query?: Query | undefined,
  ): Promise<PaginatedResponse<Required<ArticleAuthorRelationship>[]>> {
    throw new Error("Method not implemented.");
  }
}
