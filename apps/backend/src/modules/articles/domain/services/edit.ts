import type { Updater } from "@articles/domain/interfaces/store";
import { ArticleUpdate } from "@articles/domain/types/update";
import { InvalidationError, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import {
  type StoreError,
  StoreErrorTag,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import { Value } from "@sinclair/typebox/value";
import { Err, type Result } from "result";

// ============================================================================
// Pure Functions - Validation
// ============================================================================

/**
 * Validates that the update data complies with the schema
 */
const validateUpdateData = (data: ArticleUpdate): boolean =>
  Value.Check(ArticleUpdate, data);

/**
 * Creates a validation error
 */
const createValidationError = (): InvalidationError =>
  new InvalidationError("Invalid input data for article update");

// ============================================================================
// Pure Functions - Error Handling
// ============================================================================

/**
 * Transforms a store error into a domain error
 */
const transformStoreError =
  (id: Id) =>
  (error: StoreError): NotFoundError | UnknownError => {
    switch (error._tag) {
      case StoreErrorTag.NotFound:
        return new NotFoundError(`Article not found: ${id}`);

      default:
        return new UnknownError(
          `Failed to update article ${id}: ${error.message}`,
          error,
        );
    }
  };

// ============================================================================
// Logging Functions
// ============================================================================

/**
 * Logs invalid data
 */
const logInvalidData = (logger: Logger) => (data: ArticleUpdate): void => {
  logger.debug(`Invalid input data for article update: ${JSON.stringify(data)}`);
};

/**
 * Logs the update attempt
 */
const logUpdateAttempt = (logger: Logger) => (id: Id, data: ArticleUpdate): void => {
  logger.debug(`Attempting to update article ${id} with data: ${JSON.stringify(data)}`);
};

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article update
 */
const executeEdit =
  (logger: Logger, store: Updater) =>
  async (
    id: Id,
    data: ArticleUpdate,
  ): Promise<
    Result<null, InvalidationError | NotFoundError | UnknownError>
  > => {
    // 1. Validate input data
    if (!validateUpdateData(data)) {
      logInvalidData(logger)(data);
      return Err(createValidationError());
    }

    // 2. Log update attempt
    logUpdateAttempt(logger)(id, data);

    // 3. Execute update in the store
    const result = await store.update(id, data);

    // 4. Transform store errors to domain
    return result.mapErr(transformStoreError(id));
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates an article editing service
 *
 * This service coordinates article updates, validating data,
 * delegating to the store and transforming errors to the appropriate domain.
 *
 * @param logger - Logger for recording operations
 * @param store - Store for updating articles
 * @returns Function that updates articles
 */
export const edit = (logger: Logger, store: Updater) =>
  executeEdit(logger, store);
