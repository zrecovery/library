import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DrizzleFinder } from "./find";
import { DrizzleLister } from "./findMany";

import type {
  Finder,
  Lister,
  Remover,
  Saver,
  Updater,
} from "@articles/domain/interfaces/store";
import type * as schema from "@shared/infrastructure/store/schema";
import { remove } from "./remove";
import { save } from "./save";
import { update } from "./update";

export const createArticleStore = (
  db: PostgresJsDatabase<typeof schema>,
): Saver & Lister & Finder & Updater & Remover => {
  return {
    findMany: new DrizzleLister(db).findMany,
    find: new DrizzleFinder(db).find,
    save: save(db),
    update: update(db),
    remove: remove(db),
  };
};
