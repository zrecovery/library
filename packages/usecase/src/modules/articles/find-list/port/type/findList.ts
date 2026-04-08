import { type Static, t as Type } from "elysia";
import { ArticleMetaSchema, ArticleSchema } from "@library/domain";
import { ChapterSchema } from "@library/domain";
import { AuthorSchema } from "@library/domain";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import {
  IdSchema,
  Id,
  PaginationQuerySchema,
  PaginationResponse,
} from "@library/domain";

export const ArticleListPort = Type.Composite([
  Type.Object({ pagination: PaginationQuerySchema }),
  Type.Object({
    keyword: Type.Optional(Type.String()),
  }),
]);
export type ArticleListPort = Static<typeof ArticleListPort>;
export const ArticleListResultPort = Type.Object({
  pagination: PaginationResponse,
  data: Type.Array(
    Type.Composite([
      IdSchema,
      ArticleMetaSchema,
      Type.Object({
        chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
      }),
      Type.Object({
        author: Type.Composite([IdSchema, AuthorSchema]),
      }),
    ]),
  ),
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
