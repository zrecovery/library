import type { Lister } from "@articles/domain/interfaces/store";
import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
import { UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

const handleQuery = (error: StoreError) => {
  switch (error._tag) {
    default:
      console.error(error);
      return new UnknownError("Unknown error", error);
  }
};

export const findMany =
  (logger: Logger, store: Lister) =>
  async (
    query: ArticleQuery,
  ): Promise<Result<ArticleListResponse, UnknownError>> => {
    const result = await store.findMany(query);
    return result.mapErr(handleQuery);
  };
