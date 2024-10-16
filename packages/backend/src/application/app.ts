import Elysia, { t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { articlesService } from "./ioc";
import { ArticleSchema } from "../domain/model";

const articlesController = new Elysia({ prefix: "/articles" })
  .use(ArticleSchema)
  .get("/", ({ query }) => articlesService.findMany(query), {
    query: "article.query",
    response: "article.list",
  })
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const result = await articlesService.find(id);
      if (result === null) {
        throw new Error("Not Found");
      }
      return result;
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: "article.detail",
    },
  )
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

export type App = typeof app;
