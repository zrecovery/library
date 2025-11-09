import type { Config } from "src/shared/domain/config";
import { connectDb } from "src/shared/infrastructure/store/connect";
import { createAuthorStore } from "../infrastructure/store";
import { detail } from "../domain/services/detail";

export const createAuthorService = (config: Config) => {
  const db = connectDb(config);
  const store = createAuthorStore(db);

  const logger = console;

  const authorFindService = detail(logger, store);

  const authorService = {
    detail: authorFindService,
  };

  return authorService;
};
