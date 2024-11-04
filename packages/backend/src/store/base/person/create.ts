import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { people } from "../../scheme";
import type { PersonCreate } from "./model";

export const create = (db: PostgresJsDatabase) => (data: PersonCreate) =>
  db
    .insert(people)
    .values(data)
    .onConflictDoNothing({ target: people.name })
    .returning();
