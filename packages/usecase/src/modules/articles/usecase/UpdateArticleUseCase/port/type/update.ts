import { type Static, t as Type } from "elysia";
import { ArticleSchema } from "@library/domain/article";
import { ChapterSchema } from "@library/domain/chapter";
import { AuthorSchema } from "@library/domain/author";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import { Id, IdSchema } from "@library/domain/common";

export const ArticleUpdatePort = Type.Composite([
  Type.Object({ article: Type.Optional(Type.Partial(ArticleSchema)) }),
  Type.Object({
    id: Id,
    chapter: Type.Optional(ChapterSchema),
    author: Type.Optional(AuthorSchema),
  }),
]);

export type ArticleUpdatePort = Static<typeof ArticleUpdatePort>;

export const ArticleUpdateErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  InvalidInput: "Invalid Input",
  NotFound: "Not Found",
});

export type ArticleUpdateErrorEnum = Static<typeof ArticleUpdateErrorEnum>;

export type ArticleUpdateResult = Result<
  null,
  TaggedError<ArticleUpdateErrorEnum>
>;
