import type { Id } from "src/model";
import type { ArticleDetail } from "../../schema/detail";

export interface Find {
  find(id: Id): Promise<ArticleDetail | null>;
}