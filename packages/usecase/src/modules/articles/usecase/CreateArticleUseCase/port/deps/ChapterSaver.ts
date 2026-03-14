import { ChapterSchema } from "@library/domain/chapter";
import { Type, type Static } from "@sinclair/typebox";
import type { Result } from "result";
import type { TaggedError } from "tag-error";

export const ChapterCreateSchema = Type.Composite([
  Type.Object({ articleId: Type.Integer() }),
  ChapterSchema,
]);
export type ChapterCreateSchema = Static<typeof ChapterCreateSchema>;

export const ChapterSaverErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type ChapterSaverErrorEnum = Static<typeof ChapterSaverErrorEnum>;

export interface ChapterSaver {
  save(
    data: ChapterCreateSchema,
  ): Promise<Result<number, TaggedError<ChapterSaverErrorEnum>>>;
}
