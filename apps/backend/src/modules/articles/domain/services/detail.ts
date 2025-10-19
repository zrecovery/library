import type { Finder } from "@articles/domain/interfaces/store";
import type { ArticleDetail } from "@articles/domain/types/detail";
import { NotFoundError, UnknownError, type Logger } from "@shared/domain";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import type { Result } from "result";
import {
  withStoreResultHandling,
  createOperationLogger,
} from "@shared/utils/fp";

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article search by ID using functional utilities
 */
const executeDetail =
  (logger: Logger, store: Finder) =>
  async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundError | UnknownError>> => {
    // Log the operation
    createOperationLogger(logger, `Searching for article with id`)(id);

    // Use store result handling utility
    const storeOperation = () => store.find(id);
    return await withStoreResultHandling<ArticleDetail, StoreError>(
      logger,
      "article",
      "Article",
      "retrieve",
      storeOperation,
      id,
    )();
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates an article detail service
 *
 * This service coordinates article search by ID,
 * delegating to the store and transforming errors to the appropriate domain.
 *
 * @param logger - Logger for recording operations
 * @param store - Store for searching articles
 * @returns Function that searches articles by ID
 */
export const detail = (logger: Logger, store: Finder) =>
  executeDetail(logger, store);
