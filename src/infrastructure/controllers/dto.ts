import { t, type TSchema } from "elysia";

export const ArticleCreatedDto = t.Object({
  title: t.String(),
  body: t.String(),
  author: t.String(),
  book: t.String(),
});


export const ArticleEditDto = t.Object({
  id: t.Number(),
  title: t.String(),
  body: t.String(),
  author: t.String(),
  book: t.String(),
});

export const ArticleDto = t.Object({
  id: t.Number(),
  title: t.String(),
  body: t.String(),
  author: t.String(),
  author_id: t.Number(),
  book: t.String(),
  book_id: t.Number(),
  love: t.Boolean()
});

export const BookDto = t.Object({
  id: t.Optional(t.Number()),
  title: t.String(),
});

export const AuthorDto = t.Object({
  id: t.Optional(t.Number()),
  name: t.String(),
});

export const ResponseResult = <M extends TSchema>(M: M) =>
  t.Object({
    type: t.String(),
    title: t.String(),
    data: M,
  });
