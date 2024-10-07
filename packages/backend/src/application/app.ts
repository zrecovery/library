import Elysia, { t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { articlesService } from "./ioc";

const detail = t.Object({
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
});

const update = t.Object({
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

const ArticleModel = new Elysia().model({
  "article.create": t.Object({
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
  }),
  "article.detail": detail,
  "article.update": update,
});

const articlesController = new Elysia({ prefix: "/articles" })
  .use(ArticleModel)

  .get("/:id", ({ params: { id } }) => articlesService.find(id), {
    params: t.Object({ id: t.Numeric() }),
    response: "article.detail",
  })
  .post("/", ({ body }) => articlesService.create(body), {
    body: "article.create",
  })
  .put("/:id", ({ body, params: { id } }) => articlesService.update(id, body), {
    params: t.Object({ id: t.Numeric() }),
    body: "article.update",
  });

const app = new Elysia();
app
  .use(swagger())
  .group("/api", (api) => api.use(articlesController))
  .listen(3000);
