import Elysia, { t, type Static } from "elysia";

export const CreateSchema = t.Object({
  title: t.String(),
  body: t.String(),
  author: t.Object({
    name: t.String(),
  }),
  chapter: t.Optional(
    t.Object({
      title: t.String(),
      order: t.Number(),
    }),
  ),
});

export type ArticleCreate = Static<typeof CreateSchema>;

export const DetailSchema = t.Object(
  {
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
        order: t.Number(),
      }),
    ),
  },
  {
    error: "Not Find",
  },
);

export type ArticleDetail = Static<typeof DetailSchema>;

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
      order: t.Number(),
    }),
  ),
});

export type ArticleUpdate = Static<typeof UpdateSchema>;

const QuerySchema = t.Object({
  keyword: t.Optional(t.String()),
  page: t.Optional(t.Numeric()),
  size: t.Optional(t.Numeric()),
});

export type ArticleQuery = Static<typeof QuerySchema>;

const ListSchema = t.Object({
  pagination: t.Object({
    current: t.Number(),
    pages: t.Number(),
    size: t.Number(),
    items: t.Number(),
  }),
  data: t.Array(
    t.Object({
      id: t.Number(),
      title: t.String(),
    }),
  ),
});

export type ArticleList = Static<typeof ListSchema>;

export const ArticleSchema = new Elysia().model({
  "article.create": CreateSchema,
  "article.detail": DetailSchema,
  "article.update": UpdateSchema,
  "article.query": QuerySchema,
  "article.list": ListSchema,
});
