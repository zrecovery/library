import { ArticleSchema } from "@library/domain";
import { AuthorSchema } from "@library/domain";
import { ChapterSchema } from "@library/domain";
import { Id, IdSchema } from "@library/domain";
import type { Rollbackable } from "@shared/rollbackable";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

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

export const ArticleDetailFinderErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleDetailFinderErrorEnum = Static<
  typeof ArticleDetailFinderErrorEnum
>;

export interface ArticleDetailFinder extends Rollbackable {
  findDetailById(
    id: Id,
  ): Promise<
    Result<ArticleDetailResultPort, TaggedError<ArticleDetailFinderErrorEnum>>
  >;
}
