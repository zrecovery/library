import type { Finder } from "@articles/domain/interfaces/store";
import type { ArticleDetail } from "@articles/domain/types/detail";

import type { StoreError } from "@shared/domain/interfaces/store.error";

import type { Logger } from "@shared/domain/interfaces/logger";
import type { Id } from "@shared/domain/types/common";
import { NotFoundError, UnknownError } from "@shared/domain/types/errors";
import type { Result } from "result";

const ErrorHandler = (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case "NotFound":
      return new NotFoundError(`Not found article: ${id}`);

    default:
      return new UnknownError(
        `Unknown Store Error When find article: ${id}`,
        error,
      );
  }
};

export const detail =
  (logger: Logger, store: Finder) =>
  async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundError | UnknownError>> => {
    logger.debug({ id }, "Finding article");

    const result = await store.find(id);

    const a = result.match({
      err: (err) => {
        return ErrorHandler(id)(err);
      },
      ok: (val) => val,
    });
    return a;
  };
