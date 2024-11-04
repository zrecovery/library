import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { people } from "../../scheme";

export const findMany = (db: PostgresJsDatabase) => (name: string) =>
  db.select().from(people).where(eq(people.name, name));
