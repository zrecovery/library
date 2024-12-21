import { find } from "@author/domain/services/find";
import type { Logger } from "src/interface/logger";
import { createContextLogger } from "@utils/logger";

export const createAuthorService = (store) => {
  const logger = createContextLogger("ArticleService");
  const finder = find;
  const findService = find(logger, store);

  return {};
};
