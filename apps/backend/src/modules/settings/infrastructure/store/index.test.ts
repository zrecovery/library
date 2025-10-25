import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import { StoreErrorTag } from "@shared/domain/interfaces/store.error";
import { and, eq, isNull } from "drizzle-orm";
import { Err, Ok } from "result";
import { Setting } from "../domain/types/settings";
import { createSettingStore } from "./index";
import { settings as settingsTable } from "./schema";

// Mock database
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
};

// Helper to reset mocks
const resetMocks = () => {
  vi.clearAllMocks();
  mockDb.select.mockReset();
  mockDb.insert.mockReset();
  mockDb.update.mockReset();
  mockDb.delete.mockReset();
  mockDb.transaction.mockReset();
};

describe("Setting Store", () => {
  let store: ReturnType<typeof createSettingStore>;

  beforeEach(() => {
    store = createSettingStore(mockDb as any);
    resetMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("find", () => {
    test("should find existing setting", async () => {
      const mockSetting = {
        id: 1,
        userId: null,
        key: "theme",
        value: '"dark"',
        type: "string",
        description: "UI theme setting",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSetting]),
      });

      const result = await store.find(1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.id).toBe(1);
        expect(result.val.key).toBe("theme");
      }
    });

    test("should return NotFound error if setting doesn't exist", async () => {
      const mockSelectResult = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      mockDb.select.mockReturnValueOnce(mockSelectResult);

      const result = await store.find(999);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.unwrapErr()._tag).toBe(StoreErrorTag.NotFound);
      }
    });
  });

  describe("create", () => {
    test("should create a new setting", async () => {
      const input = {
        key: "theme",
        value: "dark",
        type: "string" as const,
        description: "UI theme setting",
      };

      const mockResult = {
        id: 1,
        userId: null,
        key: "theme",
        value: '"dark"',
        type: "string",
        description: "UI theme setting",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      });

      const result = await store.create(input);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("theme");
        expect(result.val.value).toBe("dark");
      }
    });

    test("should return error for invalid setting", async () => {
      const input = {
        key: "123invalid", // Invalid key format
        value: "dark",
      };

      // Mock the validation to fail
      const result = await store.create(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.unwrapErr()._tag).toBe(StoreErrorTag.Invalidation);
      }
    });
  });

  describe("upsert", () => {
    test("should create setting if it doesn't exist", async () => {
      // First, return empty results for find query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Then, mock the insert operation
      const mockResult = {
        id: 1,
        userId: null,
        key: "testSetting",
        value: '"testValue"',
        type: "string",
        description: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockResult]),
      });

      const result = await store.upsert(null, "testSetting", {
        key: "testSetting",
        value: "testValue",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("testSetting");
      }
    });

    test("should update setting if it exists", async () => {
      const existingSetting = {
        id: 1,
        userId: null,
        key: "existingSetting",
        value: '"oldValue"',
        type: "string",
        description: "description",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First, return the existing setting
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([existingSetting]),
      });

      // Then, mock the update operation
      const updatedResult = {
        ...existingSetting,
        value: '"newValue"',
        updatedAt: new Date(),
      };

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedResult]),
      });

      const result = await store.upsert(null, "existingSetting", {
        key: "existingSetting",
        value: "newValue",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.value).toBe("newValue");
      }
    });
  });

  describe("update", () => {
    test("should update existing setting", async () => {
      // First, find the existing setting
      const existingSetting = {
        id: 1,
        userId: null,
        key: "theme",
        value: '"oldTheme"',
        type: "string",
        description: "UI theme setting",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([existingSetting]),
      });

      // Then, mock the update
      const updatedSetting = {
        ...existingSetting,
        value: '"newTheme"',
        updatedAt: new Date(),
      };

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([updatedSetting]),
      });

      const result = await store.update(1, {
        key: "theme",
        value: "newTheme",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.value).toBe("newTheme");
      }
    });

    test("should return NotFound error if setting doesn't exist", async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await store.update(999, {
        key: "theme",
        value: "dark",
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.unwrapErr()._tag).toBe(StoreErrorTag.NotFound);
      }
    });
  });

  describe("remove", () => {
    test("should remove existing setting", async () => {
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValue({ rowCount: 1 }),
      });

      const result = await store.remove(1);

      expect(result.isOk()).toBe(true);
      expect(result.isOk() ? result.val : null).toBe(null);
    });

    test("should return NotFound error if setting doesn't exist", async () => {
      mockDb.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValue({ rowCount: 0 }),
      });

      const result = await store.remove(999);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.unwrapErr()._tag).toBe(StoreErrorTag.NotFound);
      }
    });
  });

  describe("findByKey", () => {
    test("should find setting by key and user ID", async () => {
      const mockSetting = {
        id: 1,
        userId: 123,
        key: "userPreference",
        value: '"value"',
        type: "string",
        description: "User preference",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockSetting]),
      });

      const result = await store.findByKey(123, "userPreference");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("userPreference");
        expect(result.val.userId).toBe(123);
      }
    });

    test("should return null if setting not found", async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await store.findByKey(123, "nonexistent");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val).toBeNull();
      }
    });
  });
});
