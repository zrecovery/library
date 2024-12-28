import { detail } from "@author/domain/services/detail";
import { createAuthorStore } from "@author/infrastructure/store";
import { connectDb } from "@shared/infrastructure/store/connect";
import { createContextLogger } from "@utils/logger";

export const createauthorService = () => {
  const uri = process.env.DATABASE_URI;
  if (uri === undefined) {
    throw new Error("No database uri provided");
  }

  const db = connectDb(uri);
  const store = createAuthorStore(db);

  const logger = createContextLogger("authorService");

  const authorFindService = detail(logger, store);

  const authorService = {
    detail: authorFindService,
  };

  return authorService;
};
