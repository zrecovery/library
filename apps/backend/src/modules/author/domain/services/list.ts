import type { FindMany } from "@author/domain/interfaces/store/find-many";
import type {
  AuthorListResponse,
  AuthorQuery,
} from "@author/domain/types/list";
import type { Logger } from "src/interface/logger";

export const list =
  (logger: Logger, store: FindMany) =>
  (query: AuthorQuery): Promise<AuthorListResponse> =>
    store.findMany(query);
