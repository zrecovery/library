import {
  type SettingService,
  createSettingStore,
  get,
  getAll,
  getSetting,
  list,
  remove,
  set,
  update,
} from "core";
import type { Database } from "core/src/shared/infrastructure/store/db";

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
