import { ArticleMetaSchema, ArticleSchema } from "@library/domain/article";
import { ChapterSchema } from "@library/domain/chapter";
import { Id, IdSchema } from "@library/domain/common";
import { type Static, Type } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ChapterDetailPort = Id;
export type ChapterDetailPort = Static<typeof ChapterDetailPort>;

export const ChapterDetailResultPort = Type.Composite([
  Type.Object({ id: Type.Number() }),
  ChapterSchema,
  Type.Object({
    articles: Type.Array(Type.Composite([IdSchema, ArticleMetaSchema])),
  }),
]);

export type ChapterDetailResultPort = Static<typeof ChapterDetailResultPort>;

export const ChapterDetailErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  NotFound: "Not Found",
});

export type ChapterDetailErrorEnum = Static<typeof ChapterDetailErrorEnum>;

export type ChapterDetailResult = Result<
  ChapterDetailResultPort,
  TaggedError<ChapterDetailErrorEnum>
>;
