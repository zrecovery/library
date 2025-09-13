import type { Finder } from "@articles/domain/interfaces/store";
import type { ArticleDetail } from "@articles/domain/types/detail";

import {
  type StoreError,
  StoreErrorTag,
} from "@shared/domain/interfaces/store.error";

import type { Logger } from "@shared/domain/interfaces/logger";
import type { Id } from "@shared/domain/types/common";
import { NotFoundError, UnknownError } from "@shared/domain/types/errors";
import type { Result } from "result";

const handleError = (logger: Logger) => (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case StoreErrorTag.NotFound:
      return new NotFoundError(`Not found article: ${id}`);
    default:
      logger.trace(error);
      return new UnknownError(
        `Unknown Store Error When find article: ${id}, ${error.message}`,
        error,
      );
  }
};

export const detail =
  (logger: Logger, store: Finder) =>
  async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundError | UnknownError>> => {
    logger.debug(`Finding article ${id}`);

    const result = await store.find(id);

    return result.mapErr(handleError(logger)(id));
  };