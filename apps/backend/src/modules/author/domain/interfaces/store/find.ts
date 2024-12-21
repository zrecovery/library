import type { AuthorDetail } from "@author/domain/types/detail";
import type { Id } from "src/model";

export interface Find {
  find(id: Id): Promise<AuthorDetail>;
}
