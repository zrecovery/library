import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
import type { UnknownStoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

export interface Lister {
  findMany(
    query: ArticleQuery,
  ): Promise<Result<ArticleListResponse, UnknownStoreError>>;
}
