import { ArticleMeta } from "@articles/port/usecase/list";
import { ArticleMetaSchema, ArticleSchema } from "@library/domain/article";
import { AuthorSchema } from "@library/domain/author";
import { Id, IdSchema } from "@library/domain/common";
import { type Static, Type } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const AuthorDetailPort = Id;
export type AuthorDetailPort = Static<typeof AuthorDetailPort>;

export const AuthorDetailResultPort = Type.Composite([
  Type.Object({ id: Type.Number() }),
  AuthorSchema,
  Type.Object({
    articles: Type.Array(Type.Composite([IdSchema, ArticleMetaSchema])),
  }),
]);

export type AuthorDetailResultPort = Static<typeof AuthorDetailResultPort>;

export const AuthorDetailErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  NotFound: "Not Found",
});

export type AuthorDetailErrorEnum = Static<typeof AuthorDetailErrorEnum>;

export type AuthorDetailResult = Result<
  AuthorDetailResultPort,
  TaggedError<AuthorDetailErrorEnum>
>;
