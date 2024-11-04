import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { create } from "./create";
import { findMany } from "./findMany";
import type { SeriesCreate } from "./model";

export const findOrCreate =
  (db: PostgresJsDatabase) => async (data: SeriesCreate) => {
    const s = await findMany(db)(data.title);
    const result = s.length < 1 ? await create(db)(data) : s;
    return result[0];
  };
