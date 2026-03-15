import { Id, IdSchema, type Pagination } from "@library/domain/common";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import type { ArticleListResultPort } from "../type/findList";

export const ArticleListFinderErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ArticleListFinderErrorEnum = Static<
  typeof ArticleListFinderErrorEnum
>;

export const QueryKeywordsSchema = Type.Object({
  positive: Type.Array(Type.String()),
  negative: Type.Array(Type.String()),
});

export type QueryKeywords = Static<typeof QueryKeywordsSchema>;

export interface ArticleListFinder {
  find(
    pagination: Pagination,
    keywords?: QueryKeywords,
  ): Promise<
    Result<ArticleListResultPort, TaggedError<ArticleListFinderErrorEnum>>
  >;
}
