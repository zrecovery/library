import type { PageQuery } from "@src/interfaces/query";
export declare const totalPaginationToPaging: (items: number, pagination: PageQuery) => {
    current: number;
    size: number;
    items: number;
    pages: number;
};
