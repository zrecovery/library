import { type Static, t as Type } from "elysia";
import { ArticleMetaSchema, ArticleSchema } from "@library/domain/article";
import { ChapterSchema } from "@library/domain/chapter";
import { AuthorSchema } from "@library/domain/author";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import {
  IdSchema,
  Id,
  PaginationQuerySchema,
  PaginationResponse,
} from "@library/domain/common";

export const ArticleListPort = Type.Composite([
  Type.Object({ pagination: PaginationQuerySchema }),
  Type.Optional(
    Type.Object({
      keyword: Type.String(),
    }),
  ),
]);
export type ArticleListPort = Static<typeof ArticleListPort>;
export const ArticleListResultPort = Type.Object({
  pagination: PaginationResponse,
  data: Type.Composite([
    IdSchema,
    ArticleMetaSchema,
    Type.Optional(
      Type.Object({
        chapter: Type.Composite([IdSchema, ChapterSchema]),
      }),
    ),
    Type.Object({
      author: Type.Composite([IdSchema, AuthorSchema]),
    }),
  ]),
});

export type ArticleListResultPort = Static<typeof ArticleListResultPort>;

export const ArticleListErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  InvalidInput: "Invalid Input",
});

export type ArticleListErrorEnum = Static<typeof ArticleListErrorEnum>;

export type ArticleListResult = Result<
  ArticleListResultPort,
  TaggedError<ArticleListErrorEnum>
>;
