import type {
  Finder,
  Lister,
  Remover,
  Saver,
  Updater,
} from "@articles/domain";
import type { Database } from "@shared/infrastructure/store/db";
import { createDrizzleFinder } from "./find";
import { createDrizzleLister } from "./findMany";
import { createDrizzleRemover } from "./remove";
import { createDrizzleSaver } from "./save";
import { createDrizzleUpdater } from "./update";

// ============================================================================
// Types
// ============================================================================

/**
 * Complete store for article operations
 */
export type ArticleStore = Saver & Lister & Finder & Updater & Remover;

// ============================================================================
// Pure Functions - Store Creation
// ============================================================================

/**
 * Creates a complete store for articles with all operations
 *
 * This factory function composes all individual repositories
 * into a single object that implements all store interfaces.
 *
 * @param db - Drizzle database instance
 * @returns Complete store with all CRUD operations
 *
 * @example
 * ```typescript
 * const db = connectDb(config.database.URI);
 * const store = createArticleStore(db);
 *
 * // Use store operations
 * await store.save(articleData);
 * await store.find(articleId);
 * await store.findMany({ page: 1, size: 10 });
 * await store.update(articleId, updateData);
 * await store.remove(articleId);
 * ```
 */
export const createArticleStore = (db: Database): ArticleStore => {
  const saver = createDrizzleSaver(db);
  const finder = createDrizzleFinder(db);
  const lister = createDrizzleLister(db);
  const updater = createDrizzleUpdater(db);
  const remover = createDrizzleRemover(db);

  return {
    save: saver.save,
    find: finder.find,
    findMany: lister.findMany,
    update: updater.update,
    remove: remover.remove,
  };
};

// ============================================================================
// Exports
// ============================================================================

// Export factory functions for individual stores
export { createDrizzleSaver } from "./save";
export { createDrizzleFinder } from "./find";
export { createDrizzleLister } from "./findMany";
export { createDrizzleUpdater } from "./update";
export { createDrizzleRemover } from "./remove";

// Export legacy classes for backward compatibility
export { DrizzleSaver } from "./save";
export { DrizzleFinder } from "./find";
export { DrizzleLister } from "./findMany";
export { DrizzleUpdater } from "./update";
export { DrizzleRemover } from "./remove";

// Export utilities
export { toModel } from "./dto";
