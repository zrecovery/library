import { eq } from "drizzle-orm";
import { series } from "../../scheme";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const findMany = (db: PostgresJsDatabase) => (title: string) =>
  db.select().from(series).where(eq(series.title, title));
