import { ChapterSchema } from "@library/domain/chapter";
import type { Rollbackable } from "@shared/rollbackable";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ChapterCreateSchema = Type.Composite([
  Type.Object({ articleId: Type.Integer() }),
  ChapterSchema,
]);
export type ChapterCreateSchema = Static<typeof ChapterCreateSchema>;

export const ChapterSaverErrorEnum = Type.Enum({
  InvalidInput: "Invalid Input",
  UnknownError: "Unknown Error",
});

export type ChapterSaverErrorEnum = Static<typeof ChapterSaverErrorEnum>;

export interface ChapterSaver extends Rollbackable {
  save(
    data: ChapterCreateSchema,
  ): Promise<Result<number, TaggedError<ChapterSaverErrorEnum>>>;
}
