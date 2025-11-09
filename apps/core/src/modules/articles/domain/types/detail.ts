import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "src/shared/domain";
import { ArticleSchema } from "src/shared/domain/types/article";
import { AuthorSchema } from "src/shared/domain/types/author";
import { ChapterSchema } from "src/shared/domain/types/chapter";

// ToDo 修改ArticleDetailSchema的定义，IdSchema应为解构后的IdSchema。
// ToDo 修改ArticleDetailSchema的定义，ArticleSchema应为解构后的ArticleSchema。
export const ArticleDetail = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Composite([IdSchema, AuthorSchema]),
    chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
  }),
]);

export type ArticleDetail = Static<typeof ArticleDetail>;
