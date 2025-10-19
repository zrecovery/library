import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError, type Logger } from "@shared/domain";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";
import {
  withStoreResultHandling,
  createOperationLogger,
} from "@shared/utils/fp";

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
export const create = (logger: Logger, store: Saver) =>
  executeCreate(logger, store);
