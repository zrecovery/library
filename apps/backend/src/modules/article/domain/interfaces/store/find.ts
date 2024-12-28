import type { ArticleDetail } from "@article/domain/types/detail";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Effect } from "effect"
import type { Id } from "src/model";

export interface Find {
  find(id: Id): Promise<Effect.Effect<ArticleDetail,StoreError>>;
}
