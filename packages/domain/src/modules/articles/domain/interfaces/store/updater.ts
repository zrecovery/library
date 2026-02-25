import type { ArticleUpdate } from "@articles/domain/types/update";
import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import type { Result } from "result";

export interface Updater {
  update(
    id: Id,
    data: ArticleUpdate,
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>>;
}
