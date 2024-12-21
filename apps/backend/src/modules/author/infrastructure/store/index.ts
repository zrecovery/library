import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { find } from "./find";
import type * as schema from "@shared/infrastructure/store/schema";
import type { Find } from "@author/domain/interfaces/store";

export const createArticleStore = (
  db: PostgresJsDatabase<typeof schema>,
): Find => {
  return {
    find: find(db),
  };
};
