import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "@shared/domain";
import { ArticleSchema } from "@shared/types/article";
import { AuthorSchema } from "@shared/types/author";
import { ChapterSchema } from "@shared/types/chapter";

export const ArticleUpdate = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Optional(AuthorSchema),
    chapter: Type.Optional(ChapterSchema),
  }),
]);

export type ArticleUpdate = Static<typeof ArticleUpdate>;
