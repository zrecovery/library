import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { create } from "./create";
import { findMany } from "./findMany";
import type { PersonCreate } from "./model";

export const findOrCreate =
  (db: PostgresJsDatabase) => async (data: PersonCreate) => {
    const p = await findMany(db)(data.name);
    const result = p.length < 1 ? await create(db)(data) : p;
    return result[0];
  };
