import { AuthorSchema } from "@library/domain/author";
import { Id } from "@library/domain/common";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const AuthorUpdateSchema = Type.Composite([
  Type.Object({ articleId: Id }),
  AuthorSchema,
]);

export type AuthorUpdateSchema = Static<typeof AuthorUpdateSchema>;

export const AuthorUpdaterErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type AuthorUpdaterErrorEnum = Static<typeof AuthorUpdaterErrorEnum>;

export interface AuthorUpdater {
  update(
    data: AuthorUpdateSchema,
  ): Promise<Result<number, TaggedError<AuthorUpdaterErrorEnum>>>;
}
