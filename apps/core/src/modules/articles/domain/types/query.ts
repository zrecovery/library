import { type Static, Type } from "@sinclair/typebox";
import { PaginationQuerySchema } from "src/shared/domain";

export const ArticleQuery = Type.Composite([
  Type.Object({
    keyword: Type.Optional(Type.String()),
  }),
  Type.Partial(PaginationQuerySchema),
]);

export type ArticleQuery = Static<typeof ArticleQuery>;

export const ArticleId = Type.Object({
  id: Type.Number(),
});
