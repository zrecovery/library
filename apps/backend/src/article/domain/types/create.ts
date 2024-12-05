import {Type, type Static } from "@sinclair/typebox";

export const ArticleCreateSchema = Type.Object({
    title: Type.String(),
    body: Type.String(),
    author: Type.Object({
        name: Type.String(),
    }),
    chapter: Type.Optional(Type.Object({
        title: Type.String(),
        order: Type.Number({ minimum: 0 }),
        series_id: Type.Optional(Type.Number()),
    })),
});

export type ArticleCreate = Static<typeof ArticleCreateSchema>;

