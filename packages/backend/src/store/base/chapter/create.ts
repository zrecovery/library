import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { chapters } from "../../scheme";
import type { ChapterCreate } from "./model";

export const create = (db: PostgresJsDatabase) => (data: ChapterCreate) =>
  db.insert(chapters).values(data).returning();
