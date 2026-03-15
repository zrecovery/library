import { ArticleSchema } from "@library/domain/article";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

const ArticleUpdate = Type.Partial(ArticleSchema);
type ArticleUpdate = Static<typeof ArticleUpdate>;

export const ArticleUpdaterErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleUpdaterErrorEnum = Static<typeof ArticleUpdaterErrorEnum>;

export interface ArticleUpdater {
  update(
    data: ArticleUpdate,
  ): Promise<Result<number, TaggedError<ArticleUpdaterErrorEnum>>>;
}
