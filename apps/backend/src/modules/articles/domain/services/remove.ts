import type { Remover } from "@articles/domain/interfaces/store";
import { type Logger, NotFoundError, UnknownError } from "@shared/domain";
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
          `Failed to remove article ${id}: ${error.message}`,
          error,
        );
    }
  };

// ============================================================================
// Logging Functions
// ============================================================================

/**
 * Logs the deletion attempt
 */
const logRemovalAttempt =
  (logger: Logger) =>
  (id: Id): void => {
    logger.debug(`Attempting to remove article with id: ${id}`);
  };

/**
 * Logs successful deletion
 */
const logRemovalSuccess =
  (logger: Logger) =>
  (id: Id): void => {
    logger.info(`Successfully removed article: ${id}`);
  };

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article deletion
 */
const executeRemove =
  (logger: Logger, store: Remover) =>
  async (id: Id): Promise<Result<null, NotFoundError | UnknownError>> => {
    // 1. Log deletion attempt
    logRemovalAttempt(logger)(id);

    // 2. Execute deletion in the store
    const result = await store.remove(id);

    // 3. Log success if applicable
    if (result.isOk()) {
      logRemovalSuccess(logger)(id);
    }

    // 4. Transform store errors to domain
    return result.mapErr(transformStoreError(logger)(id));
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates an article deletion service
 *
 * This service coordinates article deletion by ID,
 * delegating to the store and transforming errors to the appropriate domain.
 *
 * @param logger - Logger for recording operations
 * @param store - Store for deleting articles
 * @returns Function that deletes articles by ID
 */
export const remove = executeRemove;
