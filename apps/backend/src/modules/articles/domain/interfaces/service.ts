import type { ArticleCreate } from "@articles/domain/types/create";

import type { ArticleUpdate } from "@articles/domain/types/update";
import type { Id } from "@shared/domain/types/common";

import type { ArticleDetail } from "@articles/domain/types/detail";
import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
import type { NotFoundError, UnknownError } from "@shared/domain/types/errors";
import type { Result } from "result";

export interface ArticleService {
  create: (data: ArticleCreate) => Promise<void>;
  edit: (id: Id, data: ArticleUpdate) => Promise<void>;
  detail: (id: Id) => Result<ArticleDetail, NotFoundError | UnknownError>;
  list: (query: ArticleQuery) => Promise<ArticleListResponse>;
  remove: (id: Id) => Promise<void>;
}
