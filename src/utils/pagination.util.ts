import { PageQuery } from "@src/interfaces/query";

export const paginationToOffsetLimit = (
  pagination: PageQuery,
): { limit: number; offset: number } => {
  const { size, page } = pagination;
  const offset: number = Math.max(page ?? 1 - 1, 0) * (size ?? 10);
  return {
    limit: size ?? 10,
    offset,
  };
};
