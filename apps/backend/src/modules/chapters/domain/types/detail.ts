import { IdSchema } from "@shared/domain";
import { AuthorSchema } from "@shared/domain/types/author";
import { ChapterSchema } from "@shared/domain/types/chapter";
import { type Static, Type } from "@sinclair/typebox";

export const ArticleMeta = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  author: Type.Composite([IdSchema, AuthorSchema]),
  chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
});

export const ChapterDetail = Type.Composite([
  IdSchema,
  Type.Object({
    title: Type.String(),
  }),
  Type.Object({
    articles: Type.Array(ArticleMeta),
  }),
]);

export type ChapterDetail = Static<typeof ChapterDetail>;
