import { detail } from "@library/domain-services/authors";
import type { Config } from "@library/domain-services/config";
import { connectDb } from "@library/infrastructure";
import { createAuthorStore } from "@library/infrastructure/authors";

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
