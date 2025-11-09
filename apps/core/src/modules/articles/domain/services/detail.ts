import type { NotFoundError } from "elysia";
import type { Result } from "result";
import {
  type Id,
  type Logger,
  UnknownError,
  createOperationLogger,
  withStoreResultHandling,
} from "src/shared/domain";
import type { StoreError } from "src/shared/domain/interfaces/store.error";
import type { Finder } from "../interfaces";
import type { ArticleDetail } from "../types";

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
export const detail = executeDetail;
