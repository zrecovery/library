import type { ChapterDetail } from "@chapters/domain/types";
import type { Id } from "@shared/domain";
import type {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

export interface Finder {
  find(
    id: Id,
  ): Promise<Result<ChapterDetail, NotFoundStoreError | UnknownStoreError>>;
}
