import type * as schema from "@shared/infrastructure/store/schema";
import type { BunSQLDatabase } from "drizzle-orm/bun-sql";

export type Database = BunSQLDatabase<typeof schema>;
