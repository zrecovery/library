import type { ArticleService } from "@library/domain/articles";
import {
  create,
  detail,
  edit,
  findMany,
  remove,
} from "@library/domain-services";
import type { Config } from "@library/domain-services/config";
import { connectDb } from "@library/infrastructure";
import { createArticleStore } from "@library/infrastructure/articles";
import { createConsoleLogger } from "src/shared/utils";

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
