import { type Static, Type } from "@sinclair/typebox";
import { IdSchema } from "src/shared/domain";
import { ArticleMetaSchema } from "src/shared/domain/types/article";
import { AuthorSchema } from "src/shared/domain/types/author";
import {
  ChapterMetaSchema,
  ChapterSchema,
} from "src/shared/domain/types/chapter";

export const AuthorDetail = Type.Composite([
  IdSchema,
  AuthorSchema,
  Type.Object({
    articles: Type.Array(
      Type.Composite([
        IdSchema,
        ArticleMetaSchema,
        Type.Object({
          author: Type.Composite([IdSchema, AuthorSchema]),
        }),
        Type.Object({
          chapter: Type.Optional(Type.Composite([IdSchema, ChapterSchema])),
        }),
      ]),
    ),
    chapters: Type.Array(Type.Composite([IdSchema, ChapterMetaSchema])),
  }),
]);

export type AuthorDetail = Static<typeof AuthorDetail>;
