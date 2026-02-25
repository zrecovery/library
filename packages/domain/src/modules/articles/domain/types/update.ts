import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "@shared/domain";
import { ArticleSchema } from "@shared/domain/types/article";
import { AuthorSchema } from "@shared/domain/types/author";
import { ChapterSchema } from "@shared/domain/types/chapter";

export const ArticleUpdate = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Optional(AuthorSchema),
    chapter: Type.Optional(ChapterSchema),
  }),
]);

export type ArticleUpdate = Static<typeof ArticleUpdate>;
