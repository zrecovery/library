import type { ArticleCreate } from "@articles/domain/types/create";
import type { UnknownStoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

export interface Saver {
  save(data: ArticleCreate): Promise<Result<null, UnknownStoreError>>;
}
