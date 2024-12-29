import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "src/model";
import { ArticleSchema } from "src/model/article";
import { AuthorSchema } from "src/model/author";
import { ChapterSchema } from "src/model/chapter";

// ToDo 修改ArticleDetailSchema的定义，IdSchema应为解构后的IdSchema。
// ToDo 修改ArticleDetailSchema的定义，ArticleSchema应为解构后的ArticleSchema。
export const ArticleDetailSchema = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Composite([IdSchema, AuthorSchema]),
    chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
  }),
]);

export type ArticleDetail = Static<typeof ArticleDetailSchema>;
