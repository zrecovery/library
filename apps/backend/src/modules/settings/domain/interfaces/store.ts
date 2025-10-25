import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";
import type {
  Setting,
  SettingCreate,
  SettingQuery,
  SettingUpdate,
} from "../types/settings";

export interface SettingStore {
  find: (id: number) => Promise<Result<Setting, StoreError>>;
  findMany: (query: SettingQuery) => Promise<Result<Setting[], StoreError>>;
  create: (data: SettingCreate) => Promise<Result<Setting, StoreError>>;
  update: (
    id: number,
    data: SettingUpdate,
  ) => Promise<Result<Setting, StoreError>>;
  upsert: (
    userId: number | null,
    key: string,
    data: SettingCreate,
  ) => Promise<Result<Setting, StoreError>>;
  remove: (id: number) => Promise<Result<null, StoreError>>;
  findByKey: (
    userId: number | null,
    key: string,
  ) => Promise<Result<Setting | null, StoreError>>;
}
