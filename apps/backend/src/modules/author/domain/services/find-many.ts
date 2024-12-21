import type { Logger } from "src/interface/logger";
import type { FindMany } from "@author/domain/interfaces/store/find-many";
import type {
  AuthorQuery,
  AuthorListResponse,
} from "@author/domain/types/list";

export const findMany =
  (logger: Logger, store: FindMany) =>
  (query: AuthorQuery): Promise<AuthorListResponse> =>
    store.findMany(query);
