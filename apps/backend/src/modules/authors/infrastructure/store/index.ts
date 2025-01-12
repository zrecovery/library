import type { Find } from "@authors/domain/interfaces/store";
import type * as schema from "@shared/infrastructure/store/schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Finder } from "./find";

export const createAuthorStore = (
  db: PostgresJsDatabase<typeof schema>,
): Find => {
  return {
    find: new Finder(db).find,
  };
};
