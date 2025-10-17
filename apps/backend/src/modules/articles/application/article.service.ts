import type { ArticleService } from "@articles/domain/interfaces/service";
import { create } from "@articles/domain/services/create";
import { detail } from "@articles/domain/services/detail";
import { edit } from "@articles/domain/services/edit";
import { findMany } from "@articles/domain/services/list";
import { remove } from "@articles/domain/services/remove";
import { createArticleStore } from "@articles/infrastructure/store";
import type { Config } from "@shared/domain/config";
import { connectDb } from "@shared/infrastructure/store/connect";

export const createArticleService = (config: Config): ArticleService => {
  const db = connectDb(config);
  const store = createArticleStore(db);

  const logger = console;
  return {
    create: create(logger, store),
    edit: edit(logger, store),
    detail: detail(logger, store),
    list: findMany(logger, store),
    remove: remove(logger, store),
  };
};
