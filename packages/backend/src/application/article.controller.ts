import Elysia, { error, t } from "elysia";
import { ArticleSchema } from "../domain/model";
import { articlesService } from "./ioc";

export const articlesController = new Elysia({ prefix: "/articles" })
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
        return error(404, "Not Found");
      }
      return result;
    },
    {
      params: t.Object({ id: t.Numeric() }),
      response: {
        200: "article.detail",
        404: t.String(),
      },
    },
  )
  .post("/", ({ body }) => articlesService.create(body), {
    body: "article.create",
  })
  .put("/:id", ({ body, params: { id } }) => articlesService.update(id, body), {
    params: t.Object({ id: t.Numeric() }),
    body: "article.update",
  })
  .delete("/:id", ({ params: { id } }) => articlesService.remove(id), {
    params: t.Object({ id: t.Numeric() }),
  });
