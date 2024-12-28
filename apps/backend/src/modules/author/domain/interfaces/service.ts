import type { Id } from "src/model";

import type { AuthorDetail } from "@author/domain/types/detail";

export interface AuthorService {
  detail: (id: Id) => Promise<AuthorDetail>;
}
