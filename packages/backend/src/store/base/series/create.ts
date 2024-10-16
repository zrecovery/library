import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { series } from "../../scheme";
import type { SeriesCreate } from "./model";

export const create = (db: PostgresJsDatabase) => (data: SeriesCreate) =>
  db.insert(series).values(data).returning();


