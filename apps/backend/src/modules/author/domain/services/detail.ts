import type { Find } from "@author/domain/interfaces/store/find";
import type { AuthorDetail } from "@author/domain/types/detail";
import type { Logger } from "src/interface/logger";
import type { Id } from "src/model";

export const detail =
  (logger: Logger, store: Find) =>
  (id: Id): Promise<AuthorDetail> => {
    logger.info({ id }, "Finding author");
    return store.find(id);
  };
