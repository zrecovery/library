import { Type, type Static } from "@sinclair/typebox";
import { IdSchema } from "src/model";
import { ArticleSchema } from "src/model/article";
import { AuthorSchema } from "src/model/author";
import { ChapterSchema } from "src/model/chapter";

export const ArticleUpdateSchema = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Optional(AuthorSchema),
    chapter: Type.Optional(ChapterSchema),
  }),
]);

export type ArticleUpdate = Static<typeof ArticleUpdateSchema>;
