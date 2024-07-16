import type { PageQuery } from "@src/interfaces/query";
export declare const paginationToOffsetLimit: (pagination: PageQuery) => {
    limit: number | undefined;
    offset: number | undefined;
};
