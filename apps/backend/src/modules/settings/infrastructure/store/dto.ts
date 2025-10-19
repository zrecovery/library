import { Value } from "@sinclair/typebox/value";
import { Result, Ok, Err } from "result";
import {
  StoreError,
  StoreErrorTag,
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import { Setting } from "../../domain/types/settings";
import { settings as settingsTable } from "./schema";

// ============================================================================
// Types and Interfaces
// ============================================================================

interface SettingEntity {
  id: number;
  user_id: number | null;
  key: string;
  value: string; // JSON string in DB
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Pure Functions - Data Transformation
// ============================================================================

const parseValue = (
  value: string,
  type: "string" | "number" | "boolean" | "json",
) => {
  try {
    // All values are stored as JSON strings in the database
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Failed to parse setting value: ${error}`);
  }
};

const serializeValue = (
  value: any,
  type: "string" | "number" | "boolean" | "json",
): string => {
  // Always serialize using JSON.stringify to maintain consistency
  return JSON.stringify(value);
};

const transformEntityToModel = (entity: SettingEntity): Setting => ({
  id: entity.id,
  userId: entity.user_id,
  key: entity.key,
  value: parseValue(entity.value, entity.type),
  type: entity.type,
  description: entity.description,
  createdAt: entity.created_at,
  updatedAt: entity.updated_at,
});

const transformModelToEntity = (model: Setting): SettingEntity => ({
  id: model.id,
  user_id: model.userId,
  key: model.key,
  value: serializeValue(model.value, model.type),
  type: model.type,
  description: model.description,
  created_at: model.createdAt,
  updated_at: model.updatedAt,
});

// ============================================================================
// Error Handling
// ============================================================================

const createNotFoundError = (id: number): StoreError => {
  return new NotFoundStoreError(`Setting with id ${id} not found`);
};

const createUnknownError = (
  message: string,
  originalError?: unknown,
): StoreError => {
  return new UnknownStoreError(message, originalError as Error);
};

// ============================================================================
// Public API
// ============================================================================

export const toModel = (entity: SettingEntity): Result<Setting, StoreError> => {
  try {
    return Ok(transformEntityToModel(entity));
  } catch (error) {
    return Err(
      createUnknownError(`Failed to transform setting entity: ${error}`, error),
    );
  }
};

export const toModelList = (
  entities: SettingEntity[],
): Result<Setting[], StoreError> => {
  try {
    return Ok(entities.map(transformEntityToModel));
  } catch (error) {
    return Err(
      createUnknownError(
        `Failed to transform setting entities: ${error}`,
        error,
      ),
    );
  }
};

export const toEntity = (model: Setting): SettingEntity =>
  transformModelToEntity(model);

export const toEntityList = (models: Setting[]): SettingEntity[] =>
  models.map(transformModelToEntity);
