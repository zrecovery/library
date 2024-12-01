// Import necessary modules from Elysia
import Elysia, { t, type Static } from "elysia";

// Schema for creating an article
export const CreateSchema = t.Object({
  title: t.String(),
  body: t.String(),
  author: t.Object({
    name: t.String(),
  }),
  chapter: t.Optional(
    t.Object({
      title: t.String(),
      order: t.Number({ minimum: 0 }),
    }),
  ),
});
export type ArticleCreate = Static<typeof CreateSchema>;

// Schema for article details
export const DetailSchema = t.Object({
  id: t.Number(),
  title: t.String(),
  body: t.String(),
  author: t.Object({
    id: t.Number(),
    name: t.String(),
  }),
  chapter: t.Optional(
    t.Object({
      id: t.Number(),
      title: t.String(),
      order: t.Number({ minimum: 0 }),
    }),
  ),
}, {
  error: "Not Found",
});
export type ArticleDetail = Static<typeof DetailSchema>;

// Schema for updating an article
const UpdateSchema = t.Object({
  id: t.Number(),
  title: t.Optional(t.String()),
  body: t.Optional(t.String()),
  author: t.Optional(
    t.Object({
      name: t.String(),
    }),
  ),
  chapter: t.Optional(
    t.Object({
      title: t.String(),
      order: t.Number({ minimum: 0 }),
    }),
  ),
});
export type ArticleUpdate = Static<typeof UpdateSchema>;

// Schema for querying articles
const QuerySchema = t.Object({
  keyword: t.Optional(t.String()),
  page: t.Optional(t.Numeric({ minimum: 0 })),
  size: t.Optional(t.Numeric({ minimum: 0 })),
});
export type ArticleQuery = Static<typeof QuerySchema>;

// Schema for article metadata
const MetaSchema = t.Object({
  id: t.Number(),
  title: t.String(),
  author: t.Optional(
    t.Object({
      name: t.String(),
    }),
  ),
  chapter: t.Optional(
    t.Object({
      title: t.String(),
      order: t.Number({ minimum: 0 }),
    }),
  ),
});
export type ArticleMeta = Static<typeof MetaSchema>;

// Schema for listing articles
const ListSchema = t.Object({
  pagination: t.Object({
    current: t.Number({ minimum: 0 }),
    pages: t.Number({ minimum: 0 }),
    size: t.Number({ minimum: 0 }),
    items: t.Number(),
  }),
  data: t.Array(MetaSchema),
});
export type ArticleList = Static<typeof ListSchema>;

// Export all schemas under a single model
export const ArticleSchema = new Elysia().model({
  "article.create": CreateSchema,
  "article.detail": DetailSchema,
  "article.update": UpdateSchema,
  "article.query": QuerySchema,
  "article.list": ListSchema,
});
