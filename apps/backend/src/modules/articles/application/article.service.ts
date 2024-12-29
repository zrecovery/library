import type { ArticleService } from "@articles/domain/interfaces/service";
import { create } from "@articles/domain/services/create";
import { detail } from "@articles/domain/services/detail";
import { edit } from "@articles/domain/services/edit";
import { findMany } from "@articles/domain/services/list";
import { remove } from "@articles/domain/services/remove";
import { createArticleStore } from "@articles/infrastructure/store";
import { connectDb } from "@shared/infrastructure/store/connect";
import { createContextLogger } from "@utils/logger";

export const createArticleService = (): ArticleService => {
  const uri = process.env.DATABASE_URI;
  if (uri === undefined) {
    throw new Error("No database uri provided");
  }

  const db = connectDb(uri);
  const store = createArticleStore(db);

  const logger = createContextLogger("ArticleService");

  const articleCreateService = create(logger, store);

  const articleUpdateService = edit(logger, store);

  const articleFindService = detail(logger, store);

  const articleFindManyService = findMany(logger, store);

  const articleRemoveService = remove(logger, store);

  const articleService = {
    create: articleCreateService,
    edit: articleUpdateService,
    detail: articleFindService,
    list: articleFindManyService,
    remove: articleRemoveService,
  };

  return articleService;
};
