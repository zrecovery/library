import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "src/shared/domain";
import { AuthorSchema } from "src/shared/domain/types/author";
import { ChapterSchema } from "src/shared/domain/types/chapter";

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
