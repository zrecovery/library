import type { Id, NotFoundError, UnknownError } from "@shared/domain/types";
import type { Result } from "result";
import type { AuthorDetail } from "../types";

export interface AuthorService {
  detail: (
    id: Id,
  ) => Promise<Result<AuthorDetail, NotFoundError | UnknownError>>;
}
