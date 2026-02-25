import { Type } from "@sinclair/typebox";

export const ArticleSchema = Type.Object({
  title: Type.String(),
  body: Type.String(),
});

export const ArticleMetaSchema = Type.Omit(ArticleSchema, ["body"]);
