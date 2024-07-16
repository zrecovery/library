import { type TSchema } from "elysia";
export declare const ResponseSchema: <M extends TSchema>(M: M) => import("@sinclair/typebox").TObject<{
    detail: M;
}>;
export declare const PaginatedResponseSchema: <M extends TSchema>(M: M) => import("@sinclair/typebox").TObject<{
    pagination: import("@sinclair/typebox").TObject<{
        items: import("@sinclair/typebox").TNumber;
        pages: import("@sinclair/typebox").TNumber;
        size: import("@sinclair/typebox").TNumber;
        current: import("@sinclair/typebox").TNumber;
    }>;
    detail: M;
}>;
