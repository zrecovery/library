import { Type, type Static } from "@sinclair/typebox";


export const ArticleDetailSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  body: Type.String(),
  author: Type.Object({
    id: Type.Number(),
    name: Type.String(),
  }),
  chapter: Type.Optional(Type.Object({
    id: Type.Number(),
    title: Type.String(),
    order: Type.Number({ minimum: 0 }),
  })),
});

export type ArticleDetail = Static<typeof ArticleDetailSchema>;

