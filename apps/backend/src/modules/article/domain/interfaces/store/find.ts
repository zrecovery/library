import type { Id } from "src/model";
import type { ArticleDetail } from "@article/domain/types/detail";

export interface Find {
  find(id: Id): Promise<ArticleDetail | null>;
}
