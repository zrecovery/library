import { Id } from "@library/domain/common";
import type { Rollbackable } from "@shared/rollbackable";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ArticleDeleterErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleDeleterErrorEnum = Static<typeof ArticleDeleterErrorEnum>;

export interface ArticleDeleter extends Rollbackable {
  delete(id: Id): Promise<Result<number, TaggedError<ArticleDeleterErrorEnum>>>;
}
