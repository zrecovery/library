import type { Result } from "result";
import type { CreatedSchema, ListQuery } from "../schema";
import type {
  InvalidateWebRepositoryError,
  NotFoundWebRepositoryError,
  UnknownWebRepositoryError,
} from "./error";
import type { ArticleDetail, ArticleListResponse } from "@core/articles/domain";
import type { AuthorDetail } from "@core/authors/domain";
import type { ChapterDetail } from "@core/chapters/domain";

export interface ArticleRepository {
  create: (
    data: CreatedSchema,
  ) => Promise<
    Result<null, InvalidateWebRepositoryError | UnknownWebRepositoryError>
  >;
  list: (
    query: ListQuery,
  ) => Promise<Result<ArticleListResponse, UnknownWebRepositoryError>>;
  detail: (
    id: number,
  ) => Promise<
    Result<
      ArticleDetail,
      UnknownWebRepositoryError | NotFoundWebRepositoryError
    >
  >;
  remove: (
    id: number,
  ) => Promise<
    Result<null, InvalidateWebRepositoryError | UnknownWebRepositoryError>
  >;
}

export interface AuthorRepository {
  detail: (
    id: number,
  ) => Promise<
    Result<AuthorDetail, NotFoundWebRepositoryError | UnknownWebRepositoryError>
  >;
}

export interface ChapterRepository {
  detail: (
    id: number,
  ) => Promise<
    Result<
      ChapterDetail,
      NotFoundWebRepositoryError | UnknownWebRepositoryError
    >
  >;
}
