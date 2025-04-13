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

/**
 * 文章服务接口
 * 定义了与文章相关的所有操作方法
 */
export interface ArticleService {
  /**
   * 创建新文章
   * @param data 文章创建所需数据
   * @returns {Promise<Result<null, UnknownError | InvalidationError>>} 返回创建结果，可能出现未知错误或验证错误
   */
  create: (
    data: ArticleCreate,
  ) => Promise<Result<null, UnknownError | InvalidationError>>;

  /**
   * 编辑现有文章
   * @param id 文章ID
   * @param data 文章更新数据
   * @returns 返回编辑结果，可能出现未找到、未知错误或验证错误
   */
  edit: (
    id: Id,
    data: ArticleUpdate,
  ) => Promise<Result<null, NotFoundError | UnknownError | InvalidationError>>;

  /**
   * 获取文章详情
   * @param id 文章ID
   * @returns 返回文章详情，可能出现未找到、未知错误或验证错误
   */
  detail: (
    id: Id,
  ) => Promise<
    Result<ArticleDetail, NotFoundError | UnknownError | InvalidationError>
  >;

  /**
   * 获取文章列表
   * @param query 查询参数
   * @returns 返回文章列表响应，可能出现未知错误或验证错误
   */
  list: (
    query: ArticleQuery,
  ) => Promise<Result<ArticleListResponse, UnknownError | InvalidationError>>;

  /**
   * 删除文章
   * @param id 文章ID
   * @returns 返回删除结果，可能出现未找到或未知错误
   */
  remove: (id: Id) => Promise<Result<null, NotFoundError | UnknownError>>;
}
