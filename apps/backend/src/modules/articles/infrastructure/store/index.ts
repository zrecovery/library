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
import { DrizzleRemover } from "./remove";
import { DrizzleSaver } from "./save";
import { DrizzleUpdater } from "./update";

export const createArticleStore = (
  db: PostgresJsDatabase<typeof schema>,
): Saver & Lister & Finder & Updater & Remover => {
  const lister = new DrizzleLister(db);
  return {
    findMany: lister.findMany,
    find: new DrizzleFinder(db).find,
    save: new DrizzleSaver(db).save,
    update: new DrizzleUpdater(db).update,
    remove: new DrizzleRemover(db).remove,
  };
};
