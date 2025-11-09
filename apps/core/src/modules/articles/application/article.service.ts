import type { Config } from "src/shared/domain/config";
import { connectDb } from "src/shared/infrastructure/store/connect";
import { createConsoleLogger } from "src/shared/utils";
import type { ArticleService } from "../domain";
import { create } from "../domain/services/create";
import { detail } from "../domain/services/detail";
import { edit } from "../domain/services/edit";
import { findMany } from "../domain/services/list";
import { createArticleStore } from "../infrastructure/store";
import { remove } from "../domain/services/remove";

export const createArticleService = (config: Config): ArticleService => {
  const db = connectDb(config);
  const store = createArticleStore(db);

  const logger = createConsoleLogger();
  return {
    create: create(logger, store),
    edit: edit(logger, store),
    detail: detail(logger, store),
    list: findMany(logger, store),
    remove: remove(logger, store),
  };
};
