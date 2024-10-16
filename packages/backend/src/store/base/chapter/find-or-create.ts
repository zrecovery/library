import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { create } from "./create";
import { findMany } from "./findMany";
import type { ChapterCreate } from "./model";

export const findOrCreate =
  (db: PostgresJsDatabase) => async (data: ChapterCreate) => {
    const s = await findMany(db)(data.article_id);
    const result = s.length < 1 ? await create(db)(data) : s;
    return result[0];
  };


