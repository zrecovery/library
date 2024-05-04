import { t } from "elysia";
import { PaginatedResponseSchema, ResponseSchema } from "../response.schema";

export const ArticleCreatedRequestDto = t.Object({
  title: t.String(),
  body: t.String(),
  author: t.String(),
  book: t.String(),
});

export const ArticleEditRequestDto = t.Object({
  id: t.Number(),
  title: t.Optional(t.String()),
  body: t.Optional(t.String()),
  author: t.Optional(t.String()),
  book: t.Optional(t.String()),
  order: t.Optional(t.String()),
});

export const ArticleDetailSchema = t.Object({
  id: t.Number(),
  title: t.String(),
  body: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
  authors: t.Optional(t.Array(t.Object({ id: t.Number(), name: t.String() }))),
  series: t.Optional(t.Object({ id: t.Number(), title: t.String() })),
  order: t.Optional(t.Number()),
});


export const ArticlePaginatedHttpDto = PaginatedResponseSchema(
  t.Array(t.Object({
    id: t.Number(),
    title: t.String(),
    body: t.String()
  })),
);

export const ArticleHttpDto = ResponseSchema(ArticleDetailSchema);
