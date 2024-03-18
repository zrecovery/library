import { Pagination } from "@src/core/schema/pagination.schema";

export const totalPaginationToPaging = (
  total: number,
  pagination: Pagination,
) => {
  return {
    ...pagination,
    total: Math.ceil(total / pagination.size),
  };
};
