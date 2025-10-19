import { Result } from "result";
import { DomainError } from "@shared/domain/interfaces/domain.error";
import {
  Setting,
  SettingCreate,
  SettingQuery,
  SettingUpdate,
} from "../types/settings";

export interface SettingService {
  get: (id: number) => Promise<Result<Setting, DomainError>>;
  list: (query: SettingQuery) => Promise<Result<Setting[], DomainError>>;
  set: (
    userId: number | null,
    key: string,
    value: any,
  ) => Promise<Result<Setting, DomainError>>;
  update: (
    id: number,
    data: SettingUpdate,
  ) => Promise<Result<Setting, DomainError>>;
  remove: (id: number) => Promise<Result<null, DomainError>>;
  getSetting: (
    userId: number | null,
    key: string,
  ) => Promise<Result<Setting | null, DomainError>>;
  getAll: (userId: number | null) => Promise<Result<Setting[], DomainError>>;
}
