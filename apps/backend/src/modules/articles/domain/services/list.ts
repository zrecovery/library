import type { Lister } from "@articles/domain/interfaces/store";
import type { ArticleListResponse } from "@articles/domain/types/list";
import { ArticleQuery } from "@articles/domain/types/query";
import { InvalidationError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import { Value } from "@sinclair/typebox/value";
import { Err, type Result } from "result";

const handleError = (error: StoreError) => {
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
  ): Promise<Result<ArticleListResponse, UnknownError | InvalidationError>> => {
    if (!Value.Check(ArticleQuery, query)) {
      return Err(new InvalidationError(`Invalid input: ${query} `));
    }
    const result = await store.findMany(query);
    return result.mapErr(handleError);
  };
