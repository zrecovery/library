import type { Find } from "@authors/domain/interfaces/store";
import type { Database } from "@shared/infrastructure/store/db";
import { Finder } from "./find";

export const createAuthorStore = (db: Database): Find => {
  return {
    find: new Finder(db).find,
  };
};
