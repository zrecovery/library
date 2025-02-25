import { expect } from "bun:test";
import {
  StoreError,
  type StoreErrorType,
} from "@shared/domain/interfaces/store.error";
import { sql } from "drizzle-orm";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/infrastructure/store/schema";
import { createContextLogger } from "./logger";

const logger = createContextLogger("TestUtils");

const TEST_DB_URI =
  process.env.DATABASE_URI ||
  "postgres://postgres:postgres@localhost:5432/test";
const queryClient = postgres(TEST_DB_URI);

export const createTestDb = () => {
  try {
    return drizzle(queryClient, { schema: schema });
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
  errorType: StoreErrorType,
  message?: string,
) => {
  try {
    await promise;
    expect().fail("Expected an error but none was thrown");
  } catch (error: unknown) {
    if (error instanceof StoreError) {
      expect(error.type).toBe(errorType);
      if (message) {
        expect(error.message).toContain(message);
      }
    } else {
      expect().fail("Expected an error but none was thrown");
    }
  }
};

export const withTestDb = (
  testFn: (db: PostgresJsDatabase<typeof schema>) => Promise<void>,
) => {
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
