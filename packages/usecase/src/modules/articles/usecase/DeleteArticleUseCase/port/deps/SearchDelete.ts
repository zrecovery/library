import type { Id } from "@library/domain/common";
import { Type } from "@sinclair/typebox";
import type { Static } from "elysia";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const SearchDeleterErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type SearchDeleterErrorEnum = Static<typeof SearchDeleterErrorEnum>;

export interface SearchDeleter {
  delete(id: Id): Promise<Result<null, TaggedError<SearchDeleterErrorEnum>>>;
}
