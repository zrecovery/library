import { Id } from "@library/domain/common";
import { type Static, Type } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import type { AuthorDetailResultPort } from "../type/findDetail";

export const AuthorDetailPort = Id;
export type AuthorDetailPort = Static<typeof AuthorDetailPort>;

export const AuthorDetailFinderErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type AuthorDetailFinderErrorEnum = Static<
  typeof AuthorDetailFinderErrorEnum
>;

export interface AuthorDetailFinder {
  findDetailById(
    id: Id,
  ): Promise<
    Result<AuthorDetailResultPort, TaggedError<AuthorDetailFinderErrorEnum>>
  >;
}
