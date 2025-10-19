import { describe, expect, test } from "bun:test";
import { Ok, Err } from "result";
import { toModel, toModelList, toEntity } from "./dto";

describe("Settings DTO", () => {
  describe("toModel", () => {
    test("should transform entity to model correctly", () => {
      const entity = {
        id: 1,
        user_id: 123,
        key: "testSetting",
        value: '"testValue"',
        type: "string" as const,
        description: "A test setting",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = toModel(entity);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.id).toBe(1);
        expect(result.val.userId).toBe(123);
        expect(result.val.key).toBe("testSetting");
        expect(result.val.value).toBe("testValue"); // Should be parsed from JSON
        expect(result.val.type).toBe("string");
        expect(result.val.description).toBe("A test setting");
        expect(result.val.createdAt).toEqual(entity.created_at);
        expect(result.val.updatedAt).toEqual(entity.updated_at);
      }
    });

    test("should handle number values correctly", () => {
      const entity = {
        id: 2,
        user_id: null,
        key: "numberSetting",
        value: "123",
        type: "number" as const,
        description: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = toModel(entity);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.value).toBe(123); // Should be parsed as number
        expect(result.val.type).toBe("number");
        expect(result.val.userId).toBeNull();
      }
    });

    test("should handle boolean values correctly", () => {
      const entity = {
        id: 3,
        user_id: null,
        key: "boolSetting",
        value: "true",
        type: "boolean" as const,
        description: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = toModel(entity);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.value).toBe(true); // Should be parsed as boolean
        expect(result.val.type).toBe("boolean");
      }
    });

    test("should handle JSON values correctly", () => {
      const entity = {
        id: 4,
        user_id: null,
        key: "jsonSetting",
        value: '{"name": "test", "count": 5}',
        type: "json" as const,
        description: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = toModel(entity);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.value).toEqual({ name: "test", count: 5 }); // Should be parsed as object
        expect(result.val.type).toBe("json");
      }
    });

    test("should return error for invalid JSON", () => {
      const entity = {
        id: 5,
        user_id: null,
        key: "invalidJsonSetting",
        value: '{"invalid": json}',
        type: "json" as const,
        description: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = toModel(entity);

      expect(result.isErr()).toBe(true);
    });
  });

  describe("toModelList", () => {
    test("should transform multiple entities to models", () => {
      const entities = [
        {
          id: 1,
          user_id: null,
          key: "setting1",
          value: '"value1"',
          type: "string" as const,
          description: "First setting",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          user_id: 123,
          key: "setting2",
          value: "42",
          type: "number" as const,
          description: undefined,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const result = toModelList(entities);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val).toHaveLength(2);
        expect(result.val[0].key).toBe("setting1");
        expect(result.val[0].value).toBe("value1");
        expect(result.val[1].key).toBe("setting2");
        expect(result.val[1].value).toBe(42);
      }
    });
  });

  describe("toEntity", () => {
    test("should transform model to entity correctly", () => {
      const model = {
        id: 1,
        userId: 123,
        key: "testSetting",
        value: "testValue",
        type: "string" as const,
        description: "A test setting",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entity = toEntity(model);

      expect(entity.id).toBe(1);
      expect(entity.user_id).toBe(123);
      expect(entity.key).toBe("testSetting");
      expect(entity.value).toBe('"testValue"'); // Should be serialized as JSON string
      expect(entity.type).toBe("string");
      expect(entity.description).toBe("A test setting");
      expect(entity.created_at).toEqual(model.createdAt);
      expect(entity.updated_at).toEqual(model.updatedAt);
    });

    test("should serialize different value types correctly", () => {
      const model = {
        id: 1,
        userId: null,
        key: "mixedSetting",
        value: { name: "test", count: 5, active: true },
        type: "json" as const,
        description: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entity = toEntity(model);

      expect(entity.value).toBe('{"name":"test","count":5,"active":true}'); // Should be JSON string
    });
  });
});
