import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const clean = async (db: PostgresJsDatabase) => {
  await db.execute(sql`DROP TABLE if exists authors;`);
  await db.execute(sql`DROP TABLE if exists people;`);
  await db.execute(sql`DROP TABLE  if exists  chapters;`);
  await db.execute(sql`DROP TABLE  if exists  series;`);
  await db.execute(sql`DROP TABLE if exists   articles;`);
};
