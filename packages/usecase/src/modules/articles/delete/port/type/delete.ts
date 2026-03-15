import { type Static, t as Type } from "elysia";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import { Id } from "@library/domain/common";

export const ArticleDeletePort = Id;

export type ArticleDeletePort = Static<typeof ArticleDeletePort>;

export const ArticleDeleteErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
  NotFound: "Not Found",
});

export type ArticleDeleteErrorEnum = Static<typeof ArticleDeleteErrorEnum>;

export type ArticleDeleteResult = Result<
  null,
  TaggedError<ArticleDeleteErrorEnum>
>;
