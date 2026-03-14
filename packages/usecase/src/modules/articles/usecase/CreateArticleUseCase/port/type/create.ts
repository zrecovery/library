import { type Static, t as Type } from "elysia";
import { ArticleSchema } from "@library/domain/article";
import { ChapterSchema } from "@library/domain/chapter";
import { AuthorSchema } from "@library/domain/author";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import type { Id } from "@library/domain/common";

export const ArticleCreatePort = Type.Composite([
  ArticleSchema,
  Type.Optional(
    Type.Object({
      chapter: ChapterSchema,
    }),
  ),
  Type.Object({
    author: AuthorSchema,
  }),
]);

export type ArticleCreatePort = Static<typeof ArticleCreatePort>;

export const ArticleCreateErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  InvalidInput: "Invalid Input",
});

export type ArticleCreateErrorEnum = Static<typeof ArticleCreateErrorEnum>;

export type ArticleCreateResult = Result<
  Id,
  TaggedError<ArticleCreateErrorEnum>
>;
