import type { PageQuery } from "@src/interfaces/query";

export const totalPaginationToPaging = (
	items: number,
	pagination: PageQuery,
) => {
	const { page, size } = pagination;
	return {
		current: page ?? 1,
		size: size ?? 10,
		items,
		pages: Math.ceil(items / (pagination.size ?? 10)),
	};
};
