import type { PageQuery } from "@src/interfaces/query";
export declare const convertPageToOffset: (pagination: PageQuery) => {
	limit: number | undefined;
	offset: number | undefined;
};
