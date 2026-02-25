import type { AuthorDetail } from "@authors/domain/types";
import type { Id } from "@shared/domain";
import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

export interface Find {
  find(
    id: Id,
  ): Promise<Result<AuthorDetail, NotFoundStoreError | UnknownStoreError>>;
}
