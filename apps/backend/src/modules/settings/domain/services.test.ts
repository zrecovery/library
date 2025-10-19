import { describe, expect, test, beforeEach, afterEach, vi } from "bun:test";
import { Ok, Err } from "result";
import { SettingStore } from "../domain/interfaces/store";
import { Setting } from "../domain/types/settings";
import { get, set, update, remove, getSetting } from "./services";

// Mock store
const mockStore: SettingStore = {
  find: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  remove: vi.fn(),
  findByKey: vi.fn(),
};

// Helper to reset mocks
const resetMocks = () => {
  vi.clearAllMocks();
  mockStore.find.mockReset();
  mockStore.findMany.mockReset();
  mockStore.create.mockReset();
  mockStore.update.mockReset();
  mockStore.upsert.mockReset();
  mockStore.remove.mockReset();
  mockStore.findByKey.mockReset();
};

describe("Setting Services", () => {
  beforeEach(() => {
    resetMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get", () => {
    test("should return setting when found", async () => {
      const mockSetting: Setting = {
        id: 1,
        userId: null,
        key: "theme",
        value: "dark",
        type: "string",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStore.find.mockResolvedValue(Ok(mockSetting));

      const service = get(mockStore);
      const result = await service(1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("theme");
      }
    });

    test("should return error when setting not found", async () => {
      const mockError = { _tag: "NotFound", message: "Setting not found" };
      mockStore.find.mockResolvedValue(Err(mockError));

      const service = get(mockStore);
      const result = await service(999);

      expect(result.isErr()).toBe(true);
    });
  });

  describe("set", () => {
    test("should set a new setting", async () => {
      const mockSetting: Setting = {
        id: 1,
        userId: null,
        key: "newSetting",
        value: "newValue",
        type: "string",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStore.upsert.mockResolvedValue(Ok(mockSetting));

      const service = set(mockStore);
      const result = await service(null, "newSetting", "newValue");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("newSetting");
        expect(result.val.value).toBe("newValue");
      }
    });
  });

  describe("update", () => {
    test("should update existing setting", async () => {
      const mockSetting: Setting = {
        id: 1,
        userId: null,
        key: "updatedSetting",
        value: "updatedValue",
        type: "string",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStore.update.mockResolvedValue(Ok(mockSetting));

      const service = update(mockStore);
      const result = await service(1, {
        key: "updatedSetting",
        value: "updatedValue",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.id).toBe(1);
        expect(result.val.value).toBe("updatedValue");
      }
    });
  });

  describe("remove", () => {
    test("should remove setting successfully", async () => {
      mockStore.remove.mockResolvedValue(Ok(null));

      const service = remove(mockStore);
      const result = await service(1);

      expect(result.isOk()).toBe(true);
    });
  });

  describe("getSetting", () => {
    test("should get setting by key and user ID", async () => {
      const mockSetting: Setting = {
        id: 1,
        userId: 123,
        key: "userPref",
        value: "prefValue",
        type: "string",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStore.findByKey.mockResolvedValue(Ok(mockSetting));

      const service = getSetting(mockStore);
      const result = await service(123, "userPref");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("userPref");
        expect(result.val.userId).toBe(123);
      }
    });

    test("should return null when setting not found", async () => {
      mockStore.findByKey.mockResolvedValue(Ok(null));

      const service = getSetting(mockStore);
      const result = await service(123, "nonexistent");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val).toBeNull();
      }
    });
  });
});
