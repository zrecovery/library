import { type Static, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Err, Ok, type Result } from "result";
import type { SettingCreate } from "../types/settings";

// ============================================================================
// Types and Interfaces
// ============================================================================

export const SettingKeySchema = Type.Object({
  key: Type.RegExp(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    description:
      "Setting key must start with a letter and contain only letters, numbers, hyphens, and underscores",
  }),
});

// Schema for validating setting updates
export const SettingUpdateSchema = Type.Object({
  key: Type.RegExp(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    description:
      "Setting key must start with a letter and contain only letters, numbers, hyphens, and underscores",
  }),
  value: Type.Union([
    Type.String(),
    Type.Number(),
    Type.Boolean(),
    Type.Record(Type.String(), Type.Unknown()),
  ]),
});

// Schema for validating setting creation
export const SettingCreateSchema = Type.Object({
  key: Type.RegExp(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    description:
      "Setting key must start with a letter and contain only letters, numbers, hyphens, and underscores",
  }),
  value: Type.Union([
    Type.String(),
    Type.Number(),
    Type.Boolean(),
    Type.Record(Type.String(), Type.Unknown()),
  ]),
  type: Type.Optional(
    Type.Union([
      Type.Literal("string"),
      Type.Literal("number"),
      Type.Literal("boolean"),
      Type.Literal("json"),
    ]),
  ),
  description: Type.Optional(Type.String({ maxLength: 500 })),
});

// Predefined system settings with validation
export const SystemSettingKeys = {
  THEME: "theme",
  LANGUAGE: "language",
  ITEMS_PER_PAGE: "itemsPerPage",
  ENABLE_NOTIFICATIONS: "enableNotifications",
  DATE_FORMAT: "dateFormat",
  CUSTOM_CSS: "customCSS",
} as const;

export type SystemSettingKey =
  (typeof SystemSettingKeys)[keyof typeof SystemSettingKeys];

// ============================================================================
// Validation Functions
// ============================================================================

export const validateSettingKey = (key: string): Result<true, string> => {
  if (!key || typeof key !== "string") {
    return Err("Setting key must be a non-empty string");
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key)) {
    return Err(
      "Setting key must start with a letter and contain only letters, numbers, hyphens, and underscores",
    );
  }

  if (key.length > 100) {
    return Err("Setting key must be 100 characters or less");
  }

  return Ok(true);
};

export const validateSettingValue = (
  value: any,
  type?: string,
): Result<true, string> => {
  if (type) {
    try {
      switch (type) {
        case "string":
          if (typeof value !== "string") {
            return Err('Value must be a string for type "string"');
          }
          break;
        case "number":
          if (typeof value !== "number") {
            return Err('Value must be a number for type "number"');
          }
          break;
        case "boolean":
          if (typeof value !== "boolean") {
            return Err('Value must be a boolean for type "boolean"');
          }
          break;
        case "json":
          // Try to serialize as JSON to ensure it's valid
          JSON.stringify(value);
          break;
        default:
          return Err(`Unknown setting type: ${type}`);
      }
    } catch (error) {
      return Err(`Invalid value for type "${type}": ${error}`);
    }
  }

  // Validate size constraints
  const serializedValue =
    typeof value === "string" ? value : JSON.stringify(value);
  if (serializedValue.length > 5000) {
    // Limit to 5KB
    return Err("Setting value is too large (max 5KB)");
  }

  return Ok(true);
};

export const validateSetting = (
  setting: SettingCreate,
): Result<true, string> => {
  // Validate key
  const keyValidation = validateSettingKey(setting.key);
  if (keyValidation.isErr()) {
    return keyValidation.mapErr((err) => `Invalid setting key: ${err}`);
  }

  // Validate value
  const valueValidation = validateSettingValue(setting.value, setting.type);
  if (valueValidation.isErr()) {
    return valueValidation.mapErr((err) => `Invalid setting value: ${err}`);
  }

  // Validate description if present
  if (setting.description && setting.description.length > 500) {
    return Err("Setting description must be 500 characters or less");
  }

  return Ok(true);
};

export const isSystemSetting = (key: string): boolean => {
  return Object.values(SystemSettingKeys).includes(key as any);
};

// ============================================================================
// Public API
// ============================================================================

export const validateAndNormalizeSetting = (
  input: any,
): Result<SettingCreate, string> => {
  // Input validation
  if (!input || typeof input !== "object") {
    return Err("Input must be an object");
  }

  const { key, value, type, description } = input;

  // Validate key
  const keyValidation = validateSettingKey(key);
  if (keyValidation.isErr()) {
    return keyValidation.mapErr((err) => `Invalid setting key: ${err}`);
  }

  // Determine type if not provided
  const computedType =
    type ||
    (typeof value === "string"
      ? "string"
      : typeof value === "number"
        ? "number"
        : typeof value === "boolean"
          ? "boolean"
          : "json");

  // Validate value against computed type
  const valueValidation = validateSettingValue(value, computedType);
  if (valueValidation.isErr()) {
    return valueValidation.mapErr((err) => `Invalid setting value: ${err}`);
  }

  // Validate description length
  if (description && description.length > 500) {
    return Err("Setting description must be 500 characters or less");
  }

  return Ok({
    key,
    value,
    type: computedType,
    description,
  });
};
