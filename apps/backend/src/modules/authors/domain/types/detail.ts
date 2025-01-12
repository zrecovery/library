import { IdSchema } from "@shared/domain";
import { ArticleMetaSchema } from "@shared/domain/types/article";
import { AuthorSchema } from "@shared/domain/types/author";
import { ChapterMetaSchema, ChapterSchema } from "@shared/domain/types/chapter";
import { type Static, Type } from "@sinclair/typebox";

export const AuthorDetail = Type.Composite([
  IdSchema,
  AuthorSchema,
  Type.Object({
    articles: Type.Array(
      Type.Composite([
        IdSchema,
        ArticleMetaSchema,
        Type.Object({
          chapters: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
        }),
      ]),
    ),
    chapters: Type.Array(Type.Composite([IdSchema, ChapterMetaSchema])),
  }),
]);

export type AuthorDetail = Static<typeof AuthorDetail>;
