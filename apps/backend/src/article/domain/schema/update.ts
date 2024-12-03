import { Type, type Static } from "@sinclair/typebox";

export const ArticleUpdateSchema = Type.Object({
    id: Type.Number(),
    title: Type.Optional(Type.String()),
    body: Type.Optional(Type.String()),
    author: Type.Optional(Type.Object({
        name: Type.String(),
    })),
    chapter: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        order: Type.Optional(Type.Number({ minimum: 0 })),
    })),
});

export type ArticleUpdate = Static<typeof ArticleUpdateSchema>;

