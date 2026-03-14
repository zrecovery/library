import { Id } from "@library/domain/common";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ArticleDeleterErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleDeleterErrorEnum = Static<typeof ArticleDeleterErrorEnum>;

export interface ArticleDeleter {
  delete(id: Id): Promise<Result<number, TaggedError<ArticleDeleterErrorEnum>>>;
}
