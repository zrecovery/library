import type { Query } from "@src/interfaces/query";

export const filterQuery = (canQueryKey: string[], query?: Query) =>
	canQueryKey.reduce(
		(
			prev: { [key: string]: string | number | string[] | undefined },
			key: string,
		) => {
			if (query) {
				if (query[key]) {
					prev[key] = query[key];
				}
			}

			return prev;
		},
		{},
	);
