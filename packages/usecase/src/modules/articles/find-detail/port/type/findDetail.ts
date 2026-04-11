import { type Static, t as Type } from "elysia";
import { ArticleSchema } from "@library/domain";
import { ChapterSchema } from "@library/domain";
import { AuthorSchema } from "@library/domain";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import { IdSchema, Id } from "@library/domain";

export const ArticleDetailPort = Id;
export type ArticleDetailPort = Static<typeof ArticleDetailPort>;
export const ArticleDetailResultPort = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
  }),
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
