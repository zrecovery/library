import type { ArticleUpdate } from "@articles/domain/types/update";
import type { Id } from "@shared/domain/types/common";

export interface Updater {
  update(id: Id, data: ArticleUpdate): Promise<void>;
}
