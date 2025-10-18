import type { Finder } from "@articles/domain/interfaces/store";
import type { ArticleDetail } from "@articles/domain/types/detail";
import { NotFoundError, UnknownError, type Logger } from "@shared/domain";
import {
  type StoreError,
  StoreErrorTag,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import type { Result } from "result";

// ============================================================================
// Pure Functions - Error Handling
// ============================================================================

/**
 * Transforms a store error into a domain error
 */
const transformStoreError =
  (logger: Logger) =>
  (id: Id) =>
  (error: StoreError): NotFoundError | UnknownError => {
    switch (error._tag) {
      case StoreErrorTag.NotFound:
        return new NotFoundError(`Article not found: ${id}`);

      default:
        logger.trace(error);
        return new UnknownError(
          `Failed to retrieve article ${id}: ${error.message}`,
          error,
        );
    }
  };

// ============================================================================
// Logging Functions
// ============================================================================

/**
 * Logs the search attempt
 */
const logSearchAttempt =
  (logger: Logger) =>
  (id: Id): void => {
    logger.debug(`Searching for article with id: ${id}`);
  };

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article search by ID
 */
const executeDetail =
  (logger: Logger, store: Finder) =>
  async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundError | UnknownError>> => {
    logSearchAttempt(logger)(id);

    const result = await store.find(id);

    return result.mapErr(transformStoreError(logger)(id));
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
