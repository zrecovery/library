import { PaginationQuerySchema } from "@shared/domain/types";
import { type Static, Type } from "@sinclair/typebox";

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
