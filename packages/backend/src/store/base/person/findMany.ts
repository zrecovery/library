import { eq } from "drizzle-orm";
import { people } from "../../scheme";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const findMany = (db: PostgresJsDatabase) => (name: string) =>
  db.select().from(people).where(eq(people.name, name));


