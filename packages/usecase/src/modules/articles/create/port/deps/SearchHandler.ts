import { Type } from "@sinclair/typebox";
import type { Static } from "elysia";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const SearchHandlerErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type SearchHandlerErrorEnum = Static<typeof SearchHandlerErrorEnum>;

export interface SearchHandler {
  index(
    content: string,
  ): Promise<Result<null, TaggedError<SearchHandlerErrorEnum>>>;
}
