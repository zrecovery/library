import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { find } from "./find";
import { findMany } from "./findMany";
import { create } from "./create";
import { update } from "./update";
import { remove } from "./remove";
import type { ArticleStore } from "../../domain/article/article-store.interface";

export const createArticleStore = (db: PostgresJsDatabase): ArticleStore => {
  return {
    findMany: findMany(db),
    find: find(db),
    create: create(db),
    update: update(db),
    remove: remove(db),
  };
};
