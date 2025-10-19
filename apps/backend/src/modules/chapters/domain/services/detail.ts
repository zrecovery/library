import type { Finder } from "@chapters/domain/interfaces/store/find";
import { type Id, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";
import type { ChapterDetail } from "../types";
import {
  withStoreResultHandling,
  createOperationLogger,
} from "@shared/utils/fp";

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
