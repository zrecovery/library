import type { ArticleUpdate } from "@articles/types/update";
import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/interfaces/store.error";
import type { Id } from "@shared/types/common";
import type { Result } from "result";

export interface Updater {
  update(
    id: Id,
    data: ArticleUpdate,
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>>;
}
