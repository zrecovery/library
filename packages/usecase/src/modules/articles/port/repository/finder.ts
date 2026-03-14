import type { ArticleDetail } from "@articles/types/detail";
import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/interfaces/store.error";
import type { Id } from "@shared/types";
import type { Result } from "result";

export interface Finder {
  find(
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundStoreError | UnknownStoreError>>;
}
