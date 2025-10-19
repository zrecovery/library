import {
  SettingService,
  Setting,
  SettingCreate,
  SettingQuery,
  SettingUpdate,
  createSettingStore,
  get,
  list,
  set,
  update,
  remove,
  getSetting,
  getAll,
} from "backend";
import { Database } from "@shared/infrastructure/database";

export const createSettingService = (db: Database): SettingService => {
  const store = createSettingStore(db);

  return {
    get: get(store),
    list: list(store),
    set: set(store),
    update: update(store),
    remove: remove(store),
    getSetting: getSetting(store),
    getAll: getAll(store),
  };
};
