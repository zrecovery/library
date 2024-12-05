import { schema } from "@article/domain/schema";
import Elysia, { error, t } from "elysia";
import { createArticleService } from "@article/application/article.service";

const articlesService = createArticleService();
export const articlesController = new Elysia({ prefix: "/articles" })
  .model(schema)
  .get("/", ({ query }) => articlesService.findMany(query), {
    query: "findMany.request",
    response: "findMany.response",
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
        200: "find.response",
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
      body: "create.request",
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
      body: "update.request",
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
