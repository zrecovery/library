import { Type, type Static } from "@sinclair/typebox";
import { PaginationResponse } from "src/model";
import { AuthorSchema } from "src/model/author";
import { ChapterSchema } from "src/model/chapter";

export const ArticleMetaSchema = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  author: AuthorSchema,
  chapter: Type.Optional(ChapterSchema),
});

export const ArticleListResponseSchema = Type.Object({
  pagination: PaginationResponse,
  data: Type.Array(ArticleMetaSchema),
});

export type ArticleMeta = Static<typeof ArticleMetaSchema>;
export type ArticleListResponse = Static<typeof ArticleListResponseSchema>;
