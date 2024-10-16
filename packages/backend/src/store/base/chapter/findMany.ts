import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Id } from "../../../domain/model";
import { chapters } from "../../scheme";

export const findMany = (db: PostgresJsDatabase) => (article_id: Id) =>
  db.select().from(chapters).where(eq(chapters.article_id,article_id));


