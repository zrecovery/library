import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/interfaces/store.error";
import type { Id } from "@shared/types/common";
import type { Result } from "result";

export interface Remover {
  remove(id: Id): Promise<Result<null, NotFoundStoreError | UnknownStoreError>>;
}
