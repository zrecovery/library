import type { Id } from "@library/domain/common";
import type { Rollbackable } from "@shared/rollbackable";
import { Type } from "@sinclair/typebox";
import type { Static } from "elysia";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const SearchDeleterErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type SearchDeleterErrorEnum = Static<typeof SearchDeleterErrorEnum>;

export interface SearchDeleter extends Rollbackable {
  delete(id: Id): Promise<Result<null, TaggedError<SearchDeleterErrorEnum>>>;
}
