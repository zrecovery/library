
import { Type, type Static } from "@sinclair/typebox";


export const ArticleMetaSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  author: Type.Optional(Type.Object({
    name: Type.String(),
  })),
  chapter: Type.Optional(Type.Object({
    title: Type.String(),
    order: Type.Number({ minimum: 0 }),
  })),
});

export const ArticleListResponseSchema = Type.Object({
  pagination: Type.Object({
    current: Type.Number({ minimum: 0 }),
    pages: Type.Number({ minimum: 0 }),
    size: Type.Number({ minimum: 0 }),
    items: Type.Number(),
  }),
  data: Type.Array(ArticleMetaSchema),
});

export type ArticleListResponse = Static<typeof ArticleListResponseSchema>;
