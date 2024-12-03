import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { find } from "./find";
import { findMany } from "./findMany";

import type * as schema from "./scheme";
import type { Find, FindMany, Remove, Save, Update } from "@article/domain/interfaces/store";
import { remove } from "./remove";
import { save } from "./save";
import { update } from "./update";

export const createArticleStore = (db: PostgresJsDatabase<typeof schema>): Save & FindMany & Find & Update & Remove => {
  return {
    findMany: findMany(db),
    find: find(db),
    save: save(db),
    update: update(db),
    remove: remove(db),
  };
};
