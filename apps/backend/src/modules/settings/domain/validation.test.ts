import { describe, expect, test } from "bun:test";
import {
  isSystemSetting,
  validateAndNormalizeSetting,
  validateSetting,
  validateSettingKey,
  validateSettingValue,
} from "./validation";

describe("Settings Validation", () => {
  describe("validateSettingKey", () => {
    test("should accept valid setting keys", () => {
      expect(validateSettingKey("theme").isOk()).toBe(true);
      expect(validateSettingKey("mySetting").isOk()).toBe(true);
      expect(validateSettingKey("my_setting").isOk()).toBe(true);
      expect(validateSettingKey("my-setting").isOk()).toBe(true);
      expect(validateSettingKey("mySetting123").isOk()).toBe(true);
    });

    test("should reject invalid setting keys", () => {
      expect(validateSettingKey("").isErr()).toBe(true);
      expect(validateSettingKey("123invalid").isErr()).toBe(true);
      expect(validateSettingKey("invalid@key").isErr()).toBe(true);
      expect(validateSettingKey(null as any).isErr()).toBe(true);
      expect(validateSettingKey(undefined as any).isErr()).toBe(true);
    });

    test("should reject keys that are too long", () => {
      const longKey = "a".repeat(101);
      expect(validateSettingKey(longKey).isErr()).toBe(true);
    });
  });

  describe("validateSettingValue", () => {
    test("should accept valid values", () => {
      expect(validateSettingValue("test", "string").isOk()).toBe(true);
      expect(validateSettingValue(123, "number").isOk()).toBe(true);
      expect(validateSettingValue(true, "boolean").isOk()).toBe(true);
      expect(validateSettingValue({ key: "value" }, "json").isOk()).toBe(true);
    });

    test("should reject invalid values for specific types", () => {
      expect(validateSettingValue(123, "string").isErr()).toBe(true);
      expect(validateSettingValue("test", "number").isErr()).toBe(true);
      expect(validateSettingValue("test", "boolean").isErr()).toBe(true);
      expect(validateSettingValue("test", "invalidType").isErr()).toBe(true);
    });

    test("should reject oversized values", () => {
      const largeValue = "a".repeat(5001);
      expect(validateSettingValue(largeValue).isErr()).toBe(true);
    });
  });

  describe("validateSetting", () => {
    test("should validate valid settings", () => {
      const validSetting = {
        key: "theme",
        value: "dark",
      };

      expect(validateSetting(validSetting).isOk()).toBe(true);
    });

    test("should reject invalid settings", () => {
      const invalidSetting = {
        key: "123invalid",
        value: "dark",
      };

      expect(validateSetting(invalidSetting).isErr()).toBe(true);
    });

    test("should validate description length", () => {
      const settingWithLongDescription = {
        key: "test",
        value: "value",
        description: "a".repeat(501),
      };

      expect(validateSetting(settingWithLongDescription).isErr()).toBe(true);
    });
  });

  describe("validateAndNormalizeSetting", () => {
    test("should normalize and validate a valid setting", () => {
      const input = {
        key: "theme",
        value: "dark",
        type: "string",
      };

      const result = validateAndNormalizeSetting(input);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.key).toBe("theme");
        expect(result.val.value).toBe("dark");
        expect(result.val.type).toBe("string");
      }
    });

    test("should determine type automatically", () => {
      const input = {
        key: "showNotifications",
        value: true,
      };

      const result = validateAndNormalizeSetting(input);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.val.type).toBe("boolean");
      }
    });

    test("should return error for invalid input", () => {
      const invalidInput = {
        key: "123invalid",
        value: "some value",
      };

      expect(validateAndNormalizeSetting(invalidInput).isErr()).toBe(true);
    });
  });

  describe("isSystemSetting", () => {
    test("should identify system settings", () => {
      expect(isSystemSetting("theme")).toBe(true);
      expect(isSystemSetting("language")).toBe(true);
      expect(isSystemSetting("nonexistent")).toBe(false);
    });
  });
});
