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

export const app = new Elysia()
  .use(swagger())
  .group("/api", (api) => api.use(articlesController))
  .get("/hi", () => "hi")
  .listen(3001);

export type Server = typeof app;
