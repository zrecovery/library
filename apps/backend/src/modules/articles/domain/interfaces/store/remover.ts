import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import type { Result } from "result";

export interface Remover {
  remove(id: Id): Promise<Result<null, NotFoundStoreError | UnknownStoreError>>;
}
