import { ArticleSchema } from "@library/domain/article";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

const ArticleCreate = ArticleSchema;
type ArticleCreate = Static<typeof ArticleCreate>;

export const ArticleSaverErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleSaverErrorEnum = Static<typeof ArticleSaverErrorEnum>;

export interface ArticleSaver {
  save(
    data: ArticleCreate,
  ): Promise<Result<number, TaggedError<ArticleSaverErrorEnum>>>;
}
