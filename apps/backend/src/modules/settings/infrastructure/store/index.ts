import { eq, and, isNull, inArray } from "drizzle-orm";
import { Result, Ok, Err } from "result";
import { Database } from "@shared/infrastructure/database";
import {
  StoreError,
  StoreErrorTag,
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import { settings as settingsTable } from "./schema";
import { toModel, toModelList, toEntity } from "./dto";
import {
  Setting,
  SettingCreate,
  SettingQuery,
  SettingUpdate,
} from "../../domain/types/settings";
import { validateAndNormalizeSetting } from "../../domain/validation";

// ============================================================================
// Types and Interfaces
// ============================================================================

// ============================================================================
// Database Operations
// ============================================================================

const findSettingById =
  (db: Database) =>
  async (id: number): Promise<Result<Setting, StoreError>> => {
    try {
      const result = await db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.id, id))
        .limit(1);

      if (result.length === 0) {
        return Err(new NotFoundStoreError(`Setting with id ${id} not found`));
      }

      return toModel(result[0]);
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to find setting: ${error}`,
          error as Error,
        ),
      );
    }
  };

const findSettings =
  (db: Database) =>
  async (query: SettingQuery): Promise<Result<Setting[], StoreError>> => {
    try {
      let dbQuery = db.select().from(settingsTable);

      if (query.userId !== undefined) {
        if (query.userId === null) {
          dbQuery = dbQuery.where(isNull(settingsTable.userId));
        } else {
          dbQuery = dbQuery.where(eq(settingsTable.userId, query.userId));
        }
      }

      if (query.keys && query.keys.length > 0) {
        dbQuery = dbQuery.where(inArray(settingsTable.key, query.keys));
      }

      const results = await dbQuery;
      return toModelList(results);
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to find settings: ${error}`,
          error as Error,
        ),
      );
    }
  };

const createSetting =
  (db: Database) =>
  async (data: SettingCreate): Promise<Result<Setting, StoreError>> => {
    try {
      // Validate the setting data
      const validatedResult = validateAndNormalizeSetting(data);
      if (validatedResult.isErr()) {
        return Err(
          new StoreError(
            `Invalid setting data: ${validatedResult.err}`,
            StoreErrorTag.Invalidation,
          ),
        );
      }

      const validatedData = validatedResult.val;

      // Determine the type if not provided
      const settingType =
        validatedData.type ||
        (typeof validatedData.value === "string"
          ? "string"
          : typeof validatedData.value === "number"
            ? "number"
            : typeof validatedData.value === "boolean"
              ? "boolean"
              : "json");

      const [newSetting] = await db
        .insert(settingsTable)
        .values({
          userId: null, // System setting by default
          key: validatedData.key,
          value: JSON.stringify(validatedData.value),
          type: settingType,
          description: validatedData.description,
        })
        .returning();

      return toModel(newSetting);
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to create setting: ${error}`,
          error as Error,
        ),
      );
    }
  };

const updateSetting =
  (db: Database) =>
  async (
    id: number,
    data: SettingUpdate,
  ): Promise<Result<Setting, StoreError>> => {
    try {
      const existing = await db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.id, id))
        .limit(1);

      if (existing.length === 0) {
        return Err(new NotFoundStoreError(`Setting with id ${id} not found`));
      }

      // Validate the setting data
      const validatedResult = validateAndNormalizeSetting({
        key: data.key,
        value: data.value,
      });
      if (validatedResult.isErr()) {
        return Err(
          new StoreError(
            `Invalid setting data: ${validatedResult.err}`,
            StoreErrorTag.Invalidation,
          ),
        );
      }

      const validatedData = validatedResult.val;

      const settingType =
        typeof validatedData.value === "string"
          ? "string"
          : typeof validatedData.value === "number"
            ? "number"
            : typeof validatedData.value === "boolean"
              ? "boolean"
              : "json";

      const [updatedSetting] = await db
        .update(settingsTable)
        .set({
          value: JSON.stringify(validatedData.value),
          type: settingType,
          key: validatedData.key, // Allow key updates in this case
          updatedAt: new Date(),
        })
        .where(eq(settingsTable.id, id))
        .returning();

      return toModel(updatedSetting);
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to update setting: ${error}`,
          error as Error,
        ),
      );
    }
  };

const upsertSetting =
  (db: Database) =>
  async (
    userId: number | null,
    key: string,
    data: SettingCreate,
  ): Promise<Result<Setting, StoreError>> => {
    try {
      // Validate the setting data
      const validatedResult = validateAndNormalizeSetting({ ...data, key });
      if (validatedResult.isErr()) {
        return Err(
          new StoreError(
            `Invalid setting data: ${validatedResult.err}`,
            StoreErrorTag.Invalidation,
          ),
        );
      }

      const validatedData = validatedResult.val;

      // First try to find existing setting
      const existing = await db
        .select()
        .from(settingsTable)
        .where(
          and(
            eq(settingsTable.key, key),
            userId === null
              ? isNull(settingsTable.userId)
              : eq(settingsTable.userId, userId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const [updatedSetting] = await db
          .update(settingsTable)
          .set({
            value: JSON.stringify(validatedData.value),
            type:
              validatedData.type ||
              (typeof validatedData.value === "string"
                ? "string"
                : typeof validatedData.value === "number"
                  ? "number"
                  : typeof validatedData.value === "boolean"
                    ? "boolean"
                    : "json"),
            description: validatedData.description,
            updatedAt: new Date(),
          })
          .where(eq(settingsTable.id, existing[0].id))
          .returning();

        return toModel(updatedSetting);
      } else {
        // Create new
        const [newSetting] = await db
          .insert(settingsTable)
          .values({
            userId: userId,
            key: validatedData.key,
            value: JSON.stringify(validatedData.value),
            type:
              validatedData.type ||
              (typeof validatedData.value === "string"
                ? "string"
                : typeof validatedData.value === "number"
                  ? "number"
                  : typeof validatedData.value === "boolean"
                    ? "boolean"
                    : "json"),
            description: validatedData.description,
          })
          .returning();

        return toModel(newSetting);
      }
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to upsert setting: ${error}`,
          error as Error,
        ),
      );
    }
  };

const removeSetting =
  (db: Database) =>
  async (id: number): Promise<Result<null, StoreError>> => {
    try {
      const result = await db
        .delete(settingsTable)
        .where(eq(settingsTable.id, id));

      if (result.rowCount === 0) {
        return Err(new NotFoundStoreError(`Setting with id ${id} not found`));
      }

      return Ok(null);
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to remove setting: ${error}`,
          error as Error,
        ),
      );
    }
  };

const findSettingByKey =
  (db: Database) =>
  async (
    userId: number | null,
    key: string,
  ): Promise<Result<Setting | null, StoreError>> => {
    try {
      const result = await db
        .select()
        .from(settingsTable)
        .where(
          and(
            eq(settingsTable.key, key),
            userId === null
              ? isNull(settingsTable.userId)
              : eq(settingsTable.userId, userId),
          ),
        )
        .limit(1);

      if (result.length === 0) {
        return Ok(null);
      }

      return toModel(result[0]);
    } catch (error) {
      return Err(
        new UnknownStoreError(
          `Failed to find setting by key: ${error}`,
          error as Error,
        ),
      );
    }
  };

// ============================================================================
// Public API
// ============================================================================

export const createSettingStore = (db: Database) => ({
  find: findSettingById(db),
  findMany: findSettings(db),
  create: createSetting(db),
  update: updateSetting(db),
  upsert: upsertSetting(db),
  remove: removeSetting(db),
  findByKey: findSettingByKey(db),
});
