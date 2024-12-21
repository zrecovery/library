import type { ArticleCreate } from "@article/domain/types/create";

import type { Id } from "src/model";
import type { ArticleUpdate } from "@article/domain/types/update";

import type { ArticleDetail } from "@article/domain/types/detail";
import type { ArticleQuery } from "@article/domain/types/query";
import type { ArticleListResponse } from "@article/domain/types/list";

export interface ArticleService {
  create: (data: ArticleCreate) => Promise<void>;
  edit: (id: Id, data: ArticleUpdate) => Promise<void>;
  detail: (id: Id) => Promise<ArticleDetail | null>;
  list: (query: ArticleQuery) => Promise<ArticleListResponse>;
  remove: (id: Id) => Promise<void>;
}
