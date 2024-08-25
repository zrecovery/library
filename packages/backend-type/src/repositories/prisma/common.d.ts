import type { Query } from "@src/interfaces/query";
export declare const filterQuery: (
	canQueryKey: string[],
	query?: Query,
) => {
	[key: string]: string | number | string[] | undefined;
};
