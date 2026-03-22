import { Id } from "@library/domain/common";
import type { Rollbackable } from "@shared/rollbackable";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ChapterDeleterErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  NotFound: "Not Found Article",
});

export type ChapterDeleterErrorEnum = Static<typeof ChapterDeleterErrorEnum>;

export interface ChapterDeleter extends Rollbackable {
  delete(
    articleId: Id,
  ): Promise<Result<null, TaggedError<ChapterDeleterErrorEnum>>>;
}
