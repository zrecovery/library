import type { ArticleListResponse } from "@articles/types/list";
import type { ArticleQuery } from "@articles/types/query";
import type { UnknownStoreError } from "@shared/interfaces/store.error";
import type { Result } from "result";

export interface Lister {
  findMany(
    query: ArticleQuery,
  ): Promise<Result<ArticleListResponse, UnknownStoreError>>;
}
