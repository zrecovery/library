import { type Static, t as Type } from "elysia";
import { ArticleSchema } from "@library/domain/article";
import { ChapterSchema } from "@library/domain/chapter";
import { AuthorSchema } from "@library/domain/author";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import { IdSchema, Id } from "@library/domain/common";

export const ArticleDetailPort = Id;
export type ArticleDetailPort = Static<typeof ArticleDetailPort>;
export const ArticleDetailResultPort = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Optional(
    Type.Object({
      chapter: Type.Composite([IdSchema, ChapterSchema]),
    }),
  ),
  Type.Object({
    author: Type.Composite([IdSchema, AuthorSchema]),
  }),
]);

export type ArticleDetailResultPort = Static<typeof ArticleDetailResultPort>;

export const ArticleDetailErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  InvalidInput: "Invalid Input",
});

export type ArticleDetailErrorEnum = Static<typeof ArticleDetailErrorEnum>;

export type ArticleDetailResult = Result<
  ArticleDetailResultPort,
  TaggedError<ArticleDetailErrorEnum>
>;
