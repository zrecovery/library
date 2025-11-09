import { t as Type, type Static } from "elysia";
import { ArticleSchema } from "src/shared/domain/types/article";
import { AuthorSchema } from "src/shared/domain/types/author";
import { ChapterSchema } from "src/shared/domain/types/chapter";

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
