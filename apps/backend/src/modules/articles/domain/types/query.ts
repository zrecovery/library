import { Type, type Static } from "@sinclair/typebox";
import { PaginationQuerySchema } from "src/model";

export const ArticleQuerySchema = Type.Composite([
  Type.Object({
    keyword: Type.Optional(Type.String()),
  }),
  Type.Partial(PaginationQuerySchema),
]);

export type ArticleQuery = Static<typeof ArticleQuerySchema>;

export const ArticleId = Type.Object({
  id: Type.Number(),
});
