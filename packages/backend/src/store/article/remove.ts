import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Id } from "../../domain/model";
import { articles } from "../scheme";

const remove = (db: PostgresJsDatabase) => async (id: Id) => {
  await db.delete(articles).where(eq(articles.id, id));
};
