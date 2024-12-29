import { Type, type Static } from "@sinclair/typebox";
import { ArticleSchema } from "src/model/article";
import { AuthorSchema } from "src/model/author";
import { ChapterSchema } from "src/model/chapter";

export const ArticleCreateSchema = Type.Composite([
  ArticleSchema,
  Type.Object({
    author: AuthorSchema,
  }),
  Type.Object({
    chapter: Type.Optional(ChapterSchema),
  }),
]);

export type ArticleCreate = Static<typeof ArticleCreateSchema>;
