import type { Result } from "result";
import type { Find } from "../interfaces";
import type { AuthorDetail } from "../types";
import type { NotFoundError } from "elysia";
import {
  type Id,
  type Logger,
  type UnknownError,
  createOperationLogger,
  withStoreResultHandling,
} from "src/shared/domain";
import type { StoreError } from "src/shared/domain/interfaces/store.error";

export const detail =
  (logger: Logger, store: Find) =>
  async (
    id: Id,
  ): Promise<Result<AuthorDetail, NotFoundError | UnknownError>> => {
    // Log the operation
    createOperationLogger(logger, `Finding author`)(id);

    // Use store result handling utility
    const storeOperation = () => store.find(id);
    return await withStoreResultHandling<AuthorDetail, StoreError>(
      logger,
      "author",
      "Author",
      "retrieve",
      storeOperation,
      id,
    )();
  };
