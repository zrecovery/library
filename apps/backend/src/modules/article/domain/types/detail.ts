import { Type, type Static } from "@sinclair/typebox";
import { IdSchema } from "src/model";
import { ArticleSchema } from "src/model/article";
import { AuthorSchema } from "src/model/author";
import { ChapterSchema } from "src/model/chapter";

export const ArticleDetailSchema = Type.Composite([
  Type.Object({
    IdSchema,
    ArticleSchema,
    author: Type.Composite([IdSchema, AuthorSchema]),
    chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
  }),
]);

export type ArticleDetail = Static<typeof ArticleDetailSchema>;
