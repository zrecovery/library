import { detail } from "@authors/domain/services/detail";
import { createAuthorStore } from "@authors/infrastructure/store";
import type { Config } from "@shared/domain/config";
import { connectDb } from "@shared/infrastructure/store/connect";
import { createContextLogger } from "@utils/logger";

export const createAuthorService = (config: Config) => {
  const uri = config.database.URI;

  const db = connectDb(uri);
  const store = createAuthorStore(db);

  const logger = createContextLogger("authorService");

  const authorFindService = detail(logger, store);

  const authorService = {
    detail: authorFindService,
  };

  return authorService;
};
