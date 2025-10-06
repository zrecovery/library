import type { Find } from "@authors/domain/interfaces/store";
import { Finder } from "./find";
import type { Database } from "@shared/infrastructure/store/db";

export const createAuthorStore = (db: Database): Find => {
  return {
    find: new Finder(db).find,
  };
};
