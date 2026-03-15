import { Type } from "@sinclair/typebox";
import type { Static } from "elysia";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const SearchUpdateHandlerErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type SearchUpdateHandlerErrorEnum = Static<
  typeof SearchUpdateHandlerErrorEnum
>;

export interface SearchUpdateHandler {
  updateIndex(
    content: string,
  ): Promise<Result<null, TaggedError<SearchUpdateHandlerErrorEnum>>>;
}
