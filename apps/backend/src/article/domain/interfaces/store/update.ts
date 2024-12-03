import type {  Id } from "src/model";
import type { ArticleUpdate } from "../../schema/update";

export interface Update {
  update(id: Id, data: ArticleUpdate): Promise<void>;
}

