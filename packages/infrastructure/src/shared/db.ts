import type * as schema from "./schema";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";

export type Database = BunSQLiteDatabase<typeof schema>;
