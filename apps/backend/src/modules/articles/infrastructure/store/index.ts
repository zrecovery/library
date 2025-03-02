
import { DrizzleFinder } from "./find";
import { DrizzleLister } from "./findMany";

import type {
  Finder,
  Lister,
  Remover,
  Saver,
  Updater,
} from "@articles/domain/interfaces/store";
import { DrizzleRemover } from "./remove";
import { DrizzleSaver } from "./save";
import { DrizzleUpdater } from "./update";
import type { Database } from "@shared/infrastructure/store/db";

export const createArticleStore = (
  db: Database,
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
