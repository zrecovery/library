import type { NotFoundError } from "elysia";
import type { Result } from "result";
import {
  createOperationLogger,
  type Id,
  type Logger,
  type UnknownError,
  withStoreResultHandling,
} from "src/shared/domain";
import type { StoreError } from "src/shared/domain/interfaces/store.error";
import type { Finder } from "../interfaces";
import type { ChapterDetail } from "../types";

export const detail =
  (logger: Logger, store: Finder) =>
  async (
    id: Id,
  ): Promise<Result<ChapterDetail, NotFoundError | UnknownError>> => {
    // Log the operation
    createOperationLogger(logger, `Finding chapter`)(id);

    // Use store result handling utility
    const storeOperation = () => store.find(id);
    return await withStoreResultHandling<ChapterDetail, StoreError>(
      logger,
      "chapter",
      "Chapter",
      "retrieve",
      storeOperation,
      id,
    )();
  };
