import type { Id } from "src/model";
import type { ArticleUpdate } from "@article/domain/types/update";

export interface Update {
  update(id: Id, data: ArticleUpdate): Promise<void>;
}
