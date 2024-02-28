import { Pagination } from "@src/core/schema/pagination.schema";

export const paginationToEntity = (pagination: Pagination): { limit: number; offset: number } => {
  const { size, page } = pagination;
  const offset: number = Math.max(page - 1, 0) * size;
  return {
    limit: size,
    offset,
  };
};

