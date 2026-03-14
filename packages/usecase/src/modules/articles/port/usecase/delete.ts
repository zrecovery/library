import { type Static, t as Type } from "elysia";
import { ArticleSchema } from "@shared/types/article";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import { IdSchema } from "@shared/types";

export const ArticleDeletePort = Type.Composite([IdSchema]);

export type ArticleDeletePort = Static<typeof ArticleDeletePort>;

export const ArticleDeleteErrorEnum = Type.Enum({
  unknown: "UNKNOWN",
  notfound: "NOT FOUND",
});

export type ArticleDeleteErrorEnum = Static<typeof ArticleDeleteErrorEnum>;

export type ArticleDeleteResult = Result<
  void,
  TaggedError<ArticleDeleteErrorEnum>
>;
