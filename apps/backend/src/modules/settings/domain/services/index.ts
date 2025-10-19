import { Result, Ok, Err } from "result";
import { DomainError, DomainErrorTag } from "@shared/domain/types/errors";
import {
  Setting,
  SettingCreate,
  SettingQuery,
  SettingUpdate,
} from "../types/settings";
import { SettingStore } from "../interfaces/store";

// ============================================================================
// Types and Interfaces
// ============================================================================

// ============================================================================
// Pure Functions - Error Handling
// ============================================================================

const transformStoreError = (error: any) => {
  if (error._tag === "NotFound") {
    return {
      _tag: DomainErrorTag.NotFound,
      message: error.message,
    };
  }
  return {
    _tag: DomainErrorTag.Unknown,
    message: error.message || "Unknown error occurred",
    originalError: error,
  };
};

// ============================================================================
// Service Functions
// ============================================================================

const executeGet =
  (store: SettingStore) =>
  async (id: number): Promise<Result<Setting, DomainError>> => {
    const result = await store.find(id);
    return result.mapErr(transformStoreError);
  };

const executeList =
  (store: SettingStore) =>
  async (query: SettingQuery): Promise<Result<Setting[], DomainError>> => {
    const result = await store.findMany(query);
    return result.mapErr(transformStoreError);
  };

const executeSet =
  (store: SettingStore) =>
  async (
    userId: number | null,
    key: string,
    value: any,
  ): Promise<Result<Setting, DomainError>> => {
    const settingData: SettingCreate = {
      key,
      value,
    };

    const result = await store.upsert(userId, key, settingData);
    return result.mapErr(transformStoreError);
  };

const executeUpdate =
  (store: SettingStore) =>
  async (
    id: number,
    data: SettingUpdate,
  ): Promise<Result<Setting, DomainError>> => {
    const result = await store.update(id, data);
    return result.mapErr(transformStoreError);
  };

const executeRemove =
  (store: SettingStore) =>
  async (id: number): Promise<Result<null, DomainError>> => {
    const result = await store.remove(id);
    return result.mapErr(transformStoreError);
  };

const executeGetSetting =
  (store: SettingStore) =>
  async (
    userId: number | null,
    key: string,
  ): Promise<Result<Setting | null, DomainError>> => {
    const result = await store.findByKey(userId, key);
    return result.mapErr(transformStoreError);
  };

const executeGetAll =
  (store: SettingStore) =>
  async (userId: number | null): Promise<Result<Setting[], DomainError>> => {
    const query: SettingQuery = { userId };
    const result = await store.findMany(query);
    return result.mapErr(transformStoreError);
  };

// ============================================================================
// Public API
// ============================================================================

export const get = (store: SettingStore) => executeGet(store);

export const list = (store: SettingStore) => executeList(store);

export const set = (store: SettingStore) => executeSet(store);

export const update = (store: SettingStore) => executeUpdate(store);

export const remove = (store: SettingStore) => executeRemove(store);

export const getSetting = (store: SettingStore) => executeGetSetting(store);

export const getAll = (store: SettingStore) => executeGetAll(store);
