import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import type * as schema from "./schema";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { ExtractTablesWithRelations } from "drizzle-orm";

export type Database = BunSQLiteDatabase<typeof schema>;
export type Transaction = SQLiteTransaction<
  "sync",
  void,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
