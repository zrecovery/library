import { ArticleSchema } from "@library/domain/article";
import { AuthorSchema } from "@library/domain/author";
import { ChapterSchema } from "@library/domain/chapter";
import { Id, IdSchema } from "@library/domain/common";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

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

type ArticleDetailResultPort = Static<typeof ArticleDetailResultPort>;

export const ArticleDetailFinderErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleDetailFinderErrorEnum = Static<
  typeof ArticleDetailFinderErrorEnum
>;

export interface ArticleDetailFinder {
  findDetailById(
    id: Id,
  ): Promise<
    Result<ArticleDetailResultPort, TaggedError<ArticleDetailFinderErrorEnum>>
  >;
}
