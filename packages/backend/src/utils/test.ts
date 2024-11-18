import { expect } from "bun:test";
import { sql } from "drizzle-orm";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from "postgres";
import * as schema from "../store/scheme";
import { createContextLogger } from "./logger";

const logger = createContextLogger("TestUtils");

const TEST_DB_URI =
  process.env.TEST_DATABASE_URI ||
  "postgres://postgres:postgres@localhost:5432/test";
  const queryClient = postgres(TEST_DB_URI);

export const createTestDb = () => {
  try {
    return drizzle( queryClient, {schema });
  } catch (error) {
    logger.error({ error }, "Failed to create test database connection");
    throw error;
  }
};

export const clearTestData = async (db: ReturnType<typeof drizzle>) => {
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
  errorType: string,
  message?: string,
) => {
  try {
    await promise;
    expect().fail("Expected an error but none was thrown");
  } catch (error: any) {
    expect(error.type).toBe(errorType);
    if (message) {
      expect(error.message).toContain(message);
    }
  }
};

export const withTestDb = (
  testFn: (db: PostgresJsDatabase) => Promise<void>,
) => {
  return async () => {
    const db = createTestDb();
    try {
      await clearTestData(db);
      await testFn(db);
    } finally {
      await clearTestData(db);
    }
  };
};
