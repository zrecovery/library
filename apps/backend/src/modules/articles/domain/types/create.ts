import { ArticleSchema } from "@shared/domain/types/article";
import { AuthorSchema } from "@shared/domain/types/author";
import { ChapterSchema } from "@shared/domain/types/chapter";
import { type Static, Type } from "@sinclair/typebox";
export * from "@sinclair/typebox";

export const ArticleCreate = Type.Composite([
  ArticleSchema,
  Type.Object({
    author: AuthorSchema,
  }),
  Type.Object({
    chapter: Type.Optional(ChapterSchema),
  }),
]);

export type ArticleCreate = Static<typeof ArticleCreate>;
