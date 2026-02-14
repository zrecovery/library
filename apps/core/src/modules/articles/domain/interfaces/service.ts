import type { ArticleCreate } from "@articles/domain/types/create";
import type { ArticleDetail } from "@articles/domain/types/detail";
import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
import type { ArticleUpdate } from "@articles/domain/types/update";
import type { Id } from "@shared/domain/types";
import type {
  InvalidationError,
  NotFoundError,
  UnknownError,
} from "@shared/domain/types/errors";
import type { Result } from "result";

/**
 * Article service interface
 * Defines all operation methods related to articles
 */
export interface ArticleService {
  /**
   * Create a new article
   * @param data - Data required for article creation
   * @returns {Promise<Result<null, UnknownError | InvalidationError>>} Returns creation result, may return unknown error or validation error
   */
  create: (
    data: ArticleCreate,
  ) => Promise<Result<null, UnknownError | InvalidationError>>;

  /**
   * Edit an existing article
   * @param id - Article ID
   * @param data - Article update data
   * @returns Returns edit result, may return not found, unknown error or validation error
   */
  edit: (
    id: Id,
    data: ArticleUpdate,
  ) => Promise<Result<null, NotFoundError | UnknownError | InvalidationError>>;

  /**
   * Get article details
   * @param id - Article ID
   * @returns Returns article details, may return not found, unknown error or validation error
   */
  detail: (
    id: Id,
  ) => Promise<
    Result<ArticleDetail, NotFoundError | UnknownError | InvalidationError>
  >;

  /**
   * Get article list
   * @param query - Query parameters
   * @returns Returns article list response, may return unknown error or validation error
   */
  list: (
    query: ArticleQuery,
  ) => Promise<Result<ArticleListResponse, UnknownError | InvalidationError>>;

  /**
   * Delete an article
   * @param id - Article ID
   * @returns Returns deletion result, may return not found or unknown error
   */
  remove: (id: Id) => Promise<Result<null, NotFoundError | UnknownError>>;
}
