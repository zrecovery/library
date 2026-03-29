import { Type } from "@sinclair/typebox";

export const ArticleSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  body: Type.String({ minLength: 1 }),
});

export const ArticleMetaSchema = Type.Omit(ArticleSchema, ["body"]);
