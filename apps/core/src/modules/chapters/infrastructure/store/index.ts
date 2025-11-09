import type { Finder } from "@chapters/domain/interfaces/store";
import type { Database } from "@shared/infrastructure/store/db";
import { DrizzleFinder } from "./finder";

export const createChapterStore = (db: Database): Finder => {
  return {
    find: new DrizzleFinder(db).find,
  };
};
