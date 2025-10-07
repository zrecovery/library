import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError, type Logger } from "@shared/domain";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

// ============================================================================
// Pure Functions - Error Handling
// ============================================================================

/**
 * Transforms a store error into a domain error
 */
const transformStoreError = (error: StoreError): UnknownError =>
  new UnknownError(
    `Failed to create article: ${error.message}`,
    error,
  );

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article creation with the store
 */
const executeCreate =
  (logger: Logger, store: Saver) =>
  async (data: ArticleCreate): Promise<Result<null, UnknownError>> => {
    logger.debug(`Creating article: ${JSON.stringify(data)}`);

    const result = await store.save(data);

    return result.mapErr(transformStoreError);
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates an article creation service
 *
 * This service coordinates article creation by delegating
 * to the store and transforming errors to the appropriate domain.
 *
 * @param logger - Logger for recording operations
 * @param store - Store for persisting articles
 * @returns Function that creates articles
 */
export const create = (logger: Logger, store: Saver) =>
  executeCreate(logger, store);
