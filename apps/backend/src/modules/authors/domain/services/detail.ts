import type { Id, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import {
  createOperationLogger,
  withStoreResultHandling,
} from "@shared/utils/fp";
import type { Result } from "result";
import type { Find } from "../interfaces";
import type { AuthorDetail } from "../types";

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
