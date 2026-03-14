import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "@shared/types";
import { ArticleSchema } from "@shared/types/article";
import { AuthorSchema } from "@shared/types/author";
import { ChapterSchema } from "@shared/types/chapter";
import type { TaggedError } from "tag-error";
import type { Result } from "result";

export const ArticleDetailPort = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Composite([IdSchema, AuthorSchema]),
    chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
  }),
]);

export type ArticleDetailPort = Static<typeof ArticleDetailPort>;

export const ArticleDetailErrorEnum = Type.Enum({
  unknown: "UNKNOWN",
});

export type ArticleDetailErrorEnum = Static<typeof ArticleDetailErrorEnum>;

export type ArticleDetailResult = Result<
  ArticleDetailPort,
  TaggedError<ArticleDetailErrorEnum>
>;
