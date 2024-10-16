import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { PersonCreate} from "./model";
import { people } from "../../scheme";

export const create = (db: PostgresJsDatabase) => (data: PersonCreate) =>
  db.insert(people).values(data).returning();


