import type { ArticleDetail } from "@articles/domain/types/detail";
import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types";
import type { Result } from "result";

export interface Finder {
  find(
    id: Id,
  ): Promise<Result<ArticleDetail, NotFoundStoreError | UnknownStoreError>>;
}
