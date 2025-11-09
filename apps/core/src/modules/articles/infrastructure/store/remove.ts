import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import type { Id } from "src/shared/domain";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "src/shared/domain/interfaces/store.error";
import type { Database } from "src/shared/infrastructure/store/db";
import {
  articles,
  authors,
  chapters,
} from "src/shared/infrastructure/store/schema";
import type { Remover } from "../../domain";

// ============================================================================
// Pure Functions - Validation
// ============================================================================

/**
 * Verifies if an article exists in the database
 */
const verifyArticleExists =
  (trx: Database) =>
  async (id: Id): Promise<boolean> => {
    const [article] = await trx
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, id));

    return article !== undefined;
  };

// ============================================================================
// Database Operations - Deletion
// ============================================================================

/**
 * Deletes author relationships associated with the article
 */
const deleteAuthorRelations =
  (trx: Database) =>
  async (articleId: Id): Promise<void> => {
    await trx.delete(authors).where(eq(authors.article_id, articleId));
  };

/**
 * Deletes chapter relationships associated with the article
 */
const deleteChapterRelations =
  (trx: Database) =>
  async (articleId: Id): Promise<void> => {
    await trx.delete(chapters).where(eq(chapters.article_id, articleId));
  };

/**
 * Deletes the main article
 */
const deleteArticle =
  (trx: Database) =>
  async (id: Id): Promise<void> => {
    await trx.delete(articles).where(eq(articles.id, id));
  };

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes the complete article deletion within a transaction
 */
const executeDeleteTransaction =
  (db: Database) =>
  async (id: Id): Promise<void> => {
    await db.transaction(async (trx) => {
      // 1. Verify that the article exists
      const exists = await verifyArticleExists(trx)(id);
      if (!exists) {
        throw new NotFoundStoreError(`Article not found: ${id}`);
      }

      // 2. Delete relationships in order
      await deleteAuthorRelations(trx)(id);
      await deleteChapterRelations(trx)(id);

      // 3. Delete the article
      await deleteArticle(trx)(id);
    });
  };

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Classifies and handles deletion errors
 */
const handleRemoveError = (
  error: unknown,
): NotFoundStoreError | UnknownStoreError => {
  if (error instanceof NotFoundStoreError) {
    return error;
  }

  if (error instanceof Error) {
    return new UnknownStoreError("Failed to remove article", error);
  }

  return new UnknownStoreError(`Unknown error: ${String(error)}`);
};

// ============================================================================
// Main Remove Function
// ============================================================================

/**
 * Executes the deletion and returns the result
 */
const executeRemove =
  (db: Database) =>
  async (
    id: Id,
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>> => {
    try {
      await executeDeleteTransaction(db)(id);
      return Ok(null);
    } catch (error) {
      return Err(handleRemoveError(error));
    }
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a functional Remover for articles
 */
export const createDrizzleRemover = (db: Database): Remover => ({
  remove: executeRemove(db),
});

/**
 * Legacy class for backward compatibility
 * @deprecated Use createDrizzleRemover instead
 */
export class DrizzleRemover implements Remover {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  remove = (
    id: Id,
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>> => {
    return executeRemove(this.#db)(id);
  };
}
