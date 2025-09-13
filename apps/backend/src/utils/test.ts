import { expect } from "bun:test";
import {
  StoreError,
  StoreErrorTag,
} from "@shared/domain/interfaces/store.error";
import { drizzle } from "drizzle-orm/bun-sql";
import { sql } from "drizzle-orm";
import * as schema from "../shared/infrastructure/store/schema";
import type { Database } from "@shared/infrastructure/store/db";

const logger = console;

const TEST_DB_URI =
  process.env.DATABASE_URI ||
  "postgres://postgres:postgres@localhost:5432/test";

export const createTestDb = (): Database => {
  try {
    return drizzle(TEST_DB_URI, { schema: schema });
  } catch (error) {
    logger.error({ error }, "Failed to create test database connection");
    throw error;
  }
};

export const clearTestData = async (db: Database) => {
  try {
    await db.execute(sql`
      TRUNCATE TABLE articles, people, authors, series, chapters CASCADE;
    `);
    logger.info("Test data cleared");
  } catch (error) {
    logger.error({ error }, "Failed to clear test data");
    throw error;
  }
};

export const expectError = async <T>(
  promise: Promise<T>,
  errorType: StoreErrorTag,
  message?: string,
) => {
  try {
    await promise;
    expect().fail("Expected an error but none was thrown");
  } catch (error: unknown) {
    if (error instanceof StoreError) {
      expect(error._tag).toBe(errorType);
      if (message) {
        expect(error.message).toContain(message);
      }
    } else {
      expect().fail("Expected an error but none was thrown");
    }
  }
};

export const withTestDb = (testFn: (db: Database) => Promise<void>) => {
  return async () => {
    const db = createTestDb();
    db.transaction(async (trx) => {
      try {
        await clearTestData(trx);
        await testFn(trx);
      } finally {
        await clearTestData(trx);
      }
    });
  };
};
