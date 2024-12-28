import type { Find } from "@author/domain/interfaces/store";
import type * as schema from "@shared/infrastructure/store/schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { find } from "./find";

export const createAuthorStore = (
  db: PostgresJsDatabase<typeof schema>,
): Find => {
  return {
    find: find(db),
  };
};
