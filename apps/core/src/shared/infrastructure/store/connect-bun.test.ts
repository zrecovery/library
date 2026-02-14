import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  connectDb,
  connectDbAsync,
  disconnectDb,
  getConnectionState,
  getDb,
} from "./connect-bun";

const createTestConfig = (uri: string) => ({
  database: {
    type: "sqlite3" as const,
    URI: uri,
    enableLogging: false,
  },
  mode: "test" as const,
});

describe("connect-bun", () => {
  const testDbPath = "/tmp/test-library.db";

  beforeEach(() => {
    disconnectDb();
  });

  afterEach(() => {
    disconnectDb();
  });

  describe("connectDb", () => {
    test("should return error when URI is empty", () => {
      const config = createTestConfig("");
      const result = connectDb(config);
      expect(result.isErr()).toBe(true);
    });

    test("should connect to SQLite successfully", () => {
      const config = createTestConfig(testDbPath);
      const result = connectDb(config);
      expect(result.isOk()).toBe(true);
    });

    test("should return existing connection on subsequent calls", () => {
      const config = createTestConfig(testDbPath);
      const result1 = connectDb(config);
      const result2 = connectDb(config);
      expect(result1.unwrap()).toBe(result2.unwrap());
    });

    test("should set connection state to connected", () => {
      const config = createTestConfig(testDbPath);
      connectDb(config);
      expect(getConnectionState()).toBe("connected");
    });
  });

  describe("getDb", () => {
    test("should return error when not initialized", () => {
      const result = getDb();
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toContain("not initialized");
    });

    test("should return database instance after connection", () => {
      const config = createTestConfig(testDbPath);
      connectDb(config);
      const result = getDb();
      expect(result.isOk()).toBe(true);
    });
  });

  describe("connectDbAsync", () => {
    test("should connect asynchronously", async () => {
      const config = createTestConfig(testDbPath);
      const result = await connectDbAsync(config);
      expect(result.isOk()).toBe(true);
    });
  });

  describe("disconnectDb", () => {
    test("should disconnect and reset state", () => {
      const config = createTestConfig(testDbPath);
      connectDb(config);
      disconnectDb();
      expect(getConnectionState()).toBe("disconnected");
    });

    test("should handle disconnect when not connected", () => {
      expect(() => disconnectDb()).not.toThrow();
    });
  });
});
