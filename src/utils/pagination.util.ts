import { PageQuery } from "@src/interfaces/query";

export const paginationToOffsetLimit = (
  pagination: PageQuery,
): { limit: number | undefined; offset: number | undefined } => {
  if (pagination.size === -1) {
    return { limit: undefined, offset: undefined };
  }
  const { size, page } = pagination;
  const offset: number = Math.max((page ?? 1) - 1, 0) * (size ?? 10);
  return {
    limit: size ?? 10,
    offset,
  };
};
