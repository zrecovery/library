import { ArticleCreateSchema } from "./create";
import { ArticleDetailSchema } from "./detail";
import { ArticleListResponseSchema } from "./list";
import { ArticleId, ArticleQuerySchema } from "./query";
import { ArticleUpdateSchema } from "./update";

export const schema = {
    "create.request": ArticleCreateSchema,
    "find.request": ArticleId,
    "find.response": ArticleDetailSchema,
    "findMany.request": ArticleQuerySchema,
    "findMany.response": ArticleListResponseSchema,
    "update.request": ArticleUpdateSchema,
    "remove.request": ArticleId,
};

