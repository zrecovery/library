import { config } from "@/application/configure";

/**
 * Returns an object with pagination parameters.
 *
 * @param page The page number.
 * @param size The number of items per page.
 * @returns An object with the limit and offset values for pagination.
 */
export const pagination = (
  page: string | null,
  size: string | null,
): { limit: number; offset: number } => {
  const limit: number = size !== null && size !== undefined ? Number(size) : config.LIMIT;
  const pageNumber: number = page !== null && size !== undefined  ? Number(page) : 1;
  const offset: number = Math.max(pageNumber - 1, 0) * limit;
  return {
    limit,
    offset,
  };
};
