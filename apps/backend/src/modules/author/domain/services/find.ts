import type { Id } from "src/model";
import type { AuthorDetail } from "@author/domain/types/detail";
import type { Logger } from "src/interface/logger";
import type { Find } from "@author/domain/interfaces/store/find";

export const find =
  (logger: Logger, store: Find) =>
  (id: Id): Promise<AuthorDetail> =>
    store.find(id);
