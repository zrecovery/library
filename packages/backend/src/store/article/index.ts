import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleStore } from "../../domain/article/article.service";
import { createBaseStore } from "../base";
import { find } from "./find";
import { findMany } from "./findMany";

export * from "./findMany";
export * from "./find";
export const createArticleStore = (db: PostgresJsDatabase): ArticleStore => {
  const baseStore = createBaseStore(db);
  return {
    findMany: findMany(db),
    find: find(db)(baseStore),
    create: create(db),
    update: update(db),
    remove: remove(db),
  };
};
