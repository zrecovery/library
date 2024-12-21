import { Type, type Static } from "@sinclair/typebox";
import { IdSchema, PaginationResponse } from "src/model";
import { ArticleMetaSchema } from "src/model/article";
import { AuthorSchema } from "src/model/author";
import { ChapterMetaSchema } from "src/model/chapter";

export const DetailSchema = Type.Composite([
  IdSchema,
  AuthorSchema,
  Type.Object({
    articles: Type.Array(Type.Composite([IdSchema, ArticleMetaSchema])),
    chapters: Type.Array(Type.Composite([IdSchema, ChapterMetaSchema])),
  }),
]);

export type AuthorDetail = Static<typeof DetailSchema>;
