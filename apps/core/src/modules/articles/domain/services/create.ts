import type { Result } from "result";
import {
  createOperationLogger,
  type Logger,
  type UnknownError,
  withStoreResultHandling,
} from "src/shared/domain";
import type { StoreError } from "src/shared/domain/interfaces/store.error";
import type { Saver } from "../interfaces";
import type { ArticleCreate } from "../types";

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article creation with the store using functional utilities
 */
const executeCreate =
  (logger: Logger, store: Saver) =>
  async (data: ArticleCreate): Promise<Result<null, UnknownError>> => {
    // Log the operation
    createOperationLogger(logger, `Creating article`)(data);

    // Use store result handling utility
    const storeOperation = () => store.save(data);
    return await withStoreResultHandling<null, StoreError>(
      logger,
      "article",
      "Article",
      "create",
      storeOperation,
    )();
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
export const create = executeCreate;
