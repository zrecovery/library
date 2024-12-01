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
  .post(
    "/",
    ({ body, set }) => {
      articlesService.create(body);
      set.status = "Created";
    },
    {
      body: "article.create",
    },
  )
  .put(
    "/:id",
    ({ body, params: { id }, set }) => {
      articlesService.update(id, body);
      set.status = "No Content";
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: "article.update",
    },
  )
  .delete(
    "/:id",
    ({ params: { id }, set }) => {
      articlesService.remove(id);
      set.status = "No Content";
    },
    {
      params: t.Object({ id: t.Numeric() }),
    },
  );
