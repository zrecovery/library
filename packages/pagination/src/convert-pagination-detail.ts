// limit if limit < 0 , it means all items, and offset is ignored.
export const convertPaginationDetail = (
	items: number,
	{ limit, offset }: { limit: number; offset: number },
) => {
	if (items <= 0) return { current: 1, size: 10, items, pages: 0 };
	if (limit <= 0) return { current: 1, size: 0, items, pages: 1 };

	const current = Math.ceil((offset > 0 ? offset : 0) / limit) + 1;
	const pages =
		items % limit === 0 ? items / limit : Math.floor(items / limit) + 1;

	return {
		current,
		size: limit,
		items,
		pages,
	};
};
