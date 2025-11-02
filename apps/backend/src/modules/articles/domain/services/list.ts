import type { Lister } from "@articles/domain/interfaces/store";
import type { ArticleListResponse } from "@articles/domain/types/list";
import { ArticleQuery } from "@articles/domain/types/query";
import { InvalidationError, type Logger, UnknownError } from "@shared/domain";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import { Value } from "@sinclair/typebox/value";
import { Err, type Result } from "result";

// ============================================================================
// Pure Functions - Validation
// ============================================================================

/**
 * Validates that the query parameters comply with the schema
 */
const validateQuery = (query: ArticleQuery): boolean =>
  Value.Check(ArticleQuery, query);

/**
 * Creates a validation error with context
 */
const createValidationError = (query: ArticleQuery): InvalidationError =>
  new InvalidationError(`Invalid query parameters: ${JSON.stringify(query)}`);

// ============================================================================
// Pure Functions - Error Handling
// ============================================================================

/**
 * Transforms a store error into a domain error
 */
const transformStoreError =
  (logger: Logger) =>
  (error: StoreError): UnknownError => {
    logger.trace(error);
    return new UnknownError(
      `Failed to retrieve article list: ${error.message}`,
      error,
    );
  };

// ============================================================================
// Logging Functions
// ============================================================================

/**
 * Logs invalid query parameters
 */
const logInvalidQuery =
  (logger: Logger) =>
  (query: ArticleQuery): void => {
    logger.error(`Invalid query parameters: ${JSON.stringify(query)}`);
  };

/**
 * Logs the search attempt
 */
const logSearchAttempt =
  (logger: Logger) =>
  (query: ArticleQuery): void => {
    logger.debug(`Searching articles with query: ${JSON.stringify(query)}`);
  };

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes article search with query parameters
 */
const executeFindMany =
  (logger: Logger, store: Lister) =>
  async (
    query: ArticleQuery,
  ): Promise<Result<ArticleListResponse, UnknownError | InvalidationError>> => {
    // 1. Validate query parameters
    if (!validateQuery(query)) {
      logInvalidQuery(logger)(query);
      return Err(createValidationError(query));
    }

    // 2. Log search attempt
    logSearchAttempt(logger)(query);

    console.log(query);
    // 3. Execute search in the store
    const result = await store.findMany(query);

    // 4. Transform store errors to domain
    return result.mapErr(transformStoreError(logger));
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates an article listing service
 *
 * This service coordinates the search for multiple articles with filters,
 * validating parameters, delegating to the store and transforming errors
 * to the appropriate domain.
 *
 * @param logger - Logger for recording operations
 * @param store - Store for searching articles
 * @returns Function that searches articles with pagination and filters
 */
export const findMany = executeFindMany;
