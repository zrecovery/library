import { Type } from "@sinclair/typebox";

export const ChapterSchema = Type.Object({
  title: Type.String(),
  order: Type.Number({ minimum: 0 }),
});

export const ChapterMetaSchema = Type.Object({
  title: Type.String(),
});
