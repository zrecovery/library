import { type Static, Type } from "@sinclair/typebox";
import { IdSchema, PaginationResponse } from "@shared/types";
import { AuthorSchema } from "@shared/types/author";
import { ChapterSchema } from "@shared/types/chapter";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ArticleListQueryPort = Type.Object({
  page: Type.Number({ minimum: 1 }),
  limit: Type.Number({ minimum: 1, maximum: 100 }),
});

export type ArticleListQueryPort = Static<typeof ArticleListQueryPort>;

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

export const ArticleListErrorEnum = Type.Enum({
  unknown: "UNKNOWN",
});

export type ArticleListErrorEnum = Static<typeof ArticleListErrorEnum>;

export type ArticleListResult = Result<
  ArticleListResponse,
  TaggedError<ArticleListErrorEnum>
>;
