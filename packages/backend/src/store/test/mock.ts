import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  mockArticles,
  mockAuthors,
  mockChapters,
  mockPeople,
  mockSeries,
} from "mockdata";
import { articles, authors, chapters, people, series } from "../scheme";
import { clean } from "./clean";
import { initTable } from "./init";

export const mockDB = async (db: PostgresJsDatabase) =>
  db.transaction(async (trx) => {
    await clean(trx);
    await initTable(trx);
    await trx.insert(articles).values(mockArticles);
    await trx.execute(
      sql`SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles));`,
    );
    await trx.insert(people).values(mockPeople);
    await trx.execute(
      sql`SELECT setval('people_id_seq', (SELECT MAX(id) FROM people));`,
    );
    await trx.insert(authors).values(mockAuthors);
    await trx.execute(
      sql`SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors));`,
    );
    await trx.insert(series).values(mockSeries);
    await trx.execute(
      sql`SELECT setval('series_id_seq', (SELECT MAX(id) FROM series));`,
    );
    await trx.insert(chapters).values(mockChapters);
    await trx.execute(
      sql`SELECT setval('chapters_id_seq', (SELECT MAX(id) FROM chapters));`,
    );
  });
