import { type Static, Type } from "@sinclair/typebox";
import { IdSchema, PaginationResponse } from "src/shared/domain";
import { AuthorSchema } from "src/shared/domain/types/author";
import { ChapterSchema } from "src/shared/domain/types/chapter";

export const ArticleMeta = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  author: Type.Composite([IdSchema, AuthorSchema]),
  chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
});

export const ArticleListResponse = Type.Object({
  pagination: PaginationResponse,
  data: Type.Array(ArticleMeta),
});

export type ArticleMeta = Static<typeof ArticleMeta>;
export type ArticleListResponse = Static<typeof ArticleListResponse>;
