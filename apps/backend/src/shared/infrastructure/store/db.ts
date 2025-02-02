import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import type * as schema from "@shared/infrastructure/store/schema";

export type Database = BunSQLDatabase<typeof schema>;
