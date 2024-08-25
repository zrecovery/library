import type { Pagination } from "model/schema";

export const convertPageToOffset = ({ size = 10, page = 1 }: Pagination) => {
	if (size === -1) return { limit: undefined, offset: undefined };
	return {
		limit: size,
		offset: Math.max(page - 1, 0) * size,
	};
};
