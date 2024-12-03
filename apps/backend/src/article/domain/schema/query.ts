import { Type, type Static } from "@sinclair/typebox";

export const ArticleQuerySchema = Type.Object({
  keyword: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ minimum: 0 })),
  size: Type.Optional(Type.Number({ minimum: 0 })),
});

export type ArticleQuery = Static<typeof ArticleQuerySchema>;

export const ArticleId = Type.Object({
  id: Type.Number(),
});
