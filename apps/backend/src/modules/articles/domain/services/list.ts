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
      return new UnknownError(`Unknown error: ${error.message}`, error);
  }
};

export const findMany =
  (logger: Logger, store: Lister) =>
  async (
    query: ArticleQuery,
  ): Promise<Result<ArticleListResponse, UnknownError | InvalidationError>> => {
    // 验证查询参数
    if (!Value.Check(ArticleQuery, query)) {
      logger.error("Invalid query parameters", query);
      return Err(
        new InvalidationError(`Invalid input: ${JSON.stringify(query)} `),
      );
    }

    console.log(query);
    const result = await store.findMany(query);
    return result.mapErr(handleError);
  };
