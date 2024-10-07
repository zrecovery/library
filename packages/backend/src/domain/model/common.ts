// 文件名: packages/backend/src/domain/model/common.ts

// 基础类型
export type Id = number;

// 分页参数
export type Pagination = Readonly<{
  page: number;
  size: number;
}>;

// 具有唯一ID的对象
export type Identity = Readonly<{
  id: Id;
}>;

// 分页响应
export type PaginatedResponse<T> = Readonly<{
  data: T;
  pagination: Readonly<{
    current: number;
    pages: number;
    size: number;
    items: number;
  }>;
}>;
