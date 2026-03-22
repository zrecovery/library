import type { Id } from "@library/domain/common";
import type { Rollbackable } from "@shared/rollbackable";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const AuthorDeleterErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type AuthorDeleterErrorEnum = Static<typeof AuthorDeleterErrorEnum>;

export interface AuthorDeleter extends Rollbackable {
  delete(
    articleId: Id,
  ): Promise<Result<number, TaggedError<AuthorDeleterErrorEnum>>>;
}
