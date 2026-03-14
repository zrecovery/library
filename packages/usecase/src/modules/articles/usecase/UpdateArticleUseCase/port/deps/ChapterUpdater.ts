import { ChapterSchema } from "@library/domain/chapter";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ChapterCreateSchema = Type.Composite([
  Type.Object({ articleId: Type.Integer() }),
  ChapterSchema,
]);
export type ChapterCreateSchema = Static<typeof ChapterCreateSchema>;

export const ChapterUpdaterErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type ChapterUpdaterErrorEnum = Static<typeof ChapterUpdaterErrorEnum>;

export interface ChapterUpdater {
  Update(
    data: ChapterCreateSchema,
  ): Promise<Result<number, TaggedError<ChapterUpdaterErrorEnum>>>;
}
