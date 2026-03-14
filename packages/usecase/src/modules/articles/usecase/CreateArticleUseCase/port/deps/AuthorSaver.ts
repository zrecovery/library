import { AuthorSchema } from "@library/domain/author";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const AuthorCreateSchema = Type.Composite([
  Type.Object({ articleId: Type.Integer() }),
  AuthorSchema,
]);

export type AuthorCreateSchema = Static<typeof AuthorCreateSchema>;

export const AuthorSaverErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type AuthorSaverErrorEnum = Static<typeof AuthorSaverErrorEnum>;

export interface AuthorSaver {
  save(
    data: AuthorCreateSchema,
  ): Promise<Result<number, TaggedError<AuthorSaverErrorEnum>>>;
}
