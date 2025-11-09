import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "src/shared/domain";
import { ArticleSchema } from "src/shared/domain/types/article";
import { AuthorSchema } from "src/shared/domain/types/author";
import { ChapterSchema } from "src/shared/domain/types/chapter";

export const ArticleUpdate = Type.Composite([
  IdSchema,
  ArticleSchema,
  Type.Object({
    author: Type.Optional(AuthorSchema),
    chapter: Type.Optional(ChapterSchema),
  }),
]);

export type ArticleUpdate = Static<typeof ArticleUpdate>;
