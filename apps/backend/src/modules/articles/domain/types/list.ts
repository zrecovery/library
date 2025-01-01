import { PaginationResponse } from "@shared/domain/types";
import { AuthorSchema } from "@shared/domain/types/author";
import { ChapterSchema } from "@shared/domain/types/chapter";
import { type Static, Type } from "@sinclair/typebox";

export const ArticleMeta = Type.Object({
  id: Type.Number(),
  title: Type.String(),
  author: AuthorSchema,
  chapter: Type.Optional(ChapterSchema),
});

export const ArticleListResponse = Type.Object({
  pagination: PaginationResponse,
  data: Type.Array(ArticleMeta),
});

export type ArticleMeta = Static<typeof ArticleMeta>;
export type ArticleListResponse = Static<typeof ArticleListResponse>;