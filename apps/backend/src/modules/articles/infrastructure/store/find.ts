import { eq } from "drizzle-orm";

import type { Finder } from "@articles/domain/interfaces/store/finder.ts";
import type { ArticleDetail } from "@articles/domain/types/detail.ts";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import type { Database } from "@shared/infrastructure/store/db.ts";
import { libraryView } from "@shared/infrastructure/store/schema.ts";
import { Err, Ok, type Result } from "result";
import { type FindResult, toModel } from "./dto.ts";

// ============================================================================
// Pure Functions - Data Transformation
// ============================================================================

/**
 * Validates that query results have the expected length
 */
const validateQueryResults = (
  results: FindResult[],
  id: Id,
): Result<FindResult[], NotFoundStoreError | UnknownStoreError> => {
  if (results.length === 0) {
    return Err(new NotFoundStoreError(`Article not found: ${id}`));
  }

  if (results.length > 1) {
    return Err(
      new UnknownStoreError(`Data integrity error: duplicate article id ${id}`),
    );
  }

  return Ok(results);
};

/**
 * Converts array of results to ArticleDetail
 */
const convertToArticleDetail = (
  results: FindResult[],
): Result<ArticleDetail, UnknownStoreError> => {
  try {
    const [firstResult] = results;
    const articleDetail = toModel(firstResult);
    return Ok(articleDetail);
  } catch (error) {
    return Err(
      new UnknownStoreError(
        "Failed to transform query result to domain model",
        error instanceof Error ? error : undefined,
      ),
    );
  }
};

/**
 * Handles query errors
 */
const handleQueryError = (error: unknown): UnknownStoreError => {
  if (error instanceof Error) {
    return new UnknownStoreError("Database query failed", error);
  }

  return new UnknownStoreError(
    `Unknown error type during query: ${String(error)}`,
  );
};

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Executes the database query
 */
const executeQuery =
  (db: Database) =>
  async (id: Id): Promise<FindResult[]> => {
    return db
      .select({
        article: {
          id: libraryView.id,
          title: libraryView.title,
          body: libraryView.body,
        },
        author: {
          id: libraryView.people_id,
          name: libraryView.people_name,
        },
        chapter: {
          id: libraryView.series_id,
          title: libraryView.series_title,
          order: libraryView.chapter_order,
        },
      })
      .from(libraryView)
      .where(eq(libraryView.id, id));
  };

// ============================================================================
// Orchestration
// ============================================================================

/**
 * Finds an article by ID with functional error handling
 */
const findArticleById =
  (db: Database) =>
  async (
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundStoreError | UnknownStoreError>> => {
    try {
      const queryResults = await executeQuery(db)(id);

      return validateQueryResults(queryResults, id).andThen(
        convertToArticleDetail,
      );
    } catch (error) {
      return Err(handleQueryError(error));
    }
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a functional Finder for articles
 */
export const createDrizzleFinder = (db: Database): Finder => ({
  find: findArticleById(db),
});

/**
 * Legacy class for backward compatibility
 * @deprecated Use createDrizzleFinder instead
 */
export class DrizzleFinder implements Finder {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  find = (id: Id): Promise<Result<ArticleDetail, NotFoundStoreError | UnknownStoreError>> => {
    return findArticleById(this.#db)(id);
  };
}
