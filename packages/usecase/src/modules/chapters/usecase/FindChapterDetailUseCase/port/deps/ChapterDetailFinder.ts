import { Id } from "@library/domain/common";
import { type Static, Type } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";
import { ChapterDetailResultPort } from "../type/findDetail";

export const ChapterDetailPort = Id;
export type ChapterDetailPort = Static<typeof ChapterDetailPort>;

export const ChapterDetailFinderErrorEnum = Type.Enum({
  NotFound: "Not Found",
  UnknownError: "Unknown Error",
});

export type ChapterDetailFinderErrorEnum = Static<
  typeof ChapterDetailFinderErrorEnum
>;

export interface ChapterDetailFinder {
  findDetailById(
    id: Id,
  ): Promise<
    Result<ChapterDetailResultPort, TaggedError<ChapterDetailFinderErrorEnum>>
  >;
}
