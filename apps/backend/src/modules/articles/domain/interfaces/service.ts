import type { ArticleCreate } from "@articles/domain/types/create";

import type { ArticleUpdate } from "@articles/domain/types/update";
import type { Id } from "@shared/domain/types";

import type { ArticleDetail } from "@articles/domain/types/detail";
import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
import type {
  InvalidationError,
  NotFoundError,
  UnknownError,
} from "@shared/domain/types/errors";
import type { Result } from "result";

export interface ArticleService {
  create: (
    data: ArticleCreate,
  ) => Promise<Result<null, UnknownError | InvalidationError>>;
  edit: (
    id: Id,
    data: ArticleUpdate,
  ) => Promise<Result<null, NotFoundError | UnknownError | InvalidationError>>;
  detail: (
    id: Id,
  ) => Promise<
    Result<ArticleDetail, NotFoundError | UnknownError | InvalidationError>
  >;
  list: (
    query: ArticleQuery,
  ) => Promise<Result<ArticleListResponse, UnknownError | InvalidationError>>;
  remove: (id: Id) => Promise<Result<null, NotFoundError | UnknownError>>;
}
