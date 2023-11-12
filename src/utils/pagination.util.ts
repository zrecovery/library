import { config } from "@/application/configure";

/**
 * Returns an object with pagination parameters.
 *
 * @param page The page number.
 * @param size The number of items per page.
 * @returns An object with the limit and offset values for pagination.
 */
export const pagination = (
  page: number = 1,
  size: number = config.LIMIT,
): { limit: number; offset: number } => ({
  limit: size,
  offset: Math.max(page - 1, 0) * size,
});
