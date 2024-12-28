import type { ArticleService } from "@article/domain/interfaces/service";
import { schema } from "@article/domain/types";
import Elysia, { error, t } from "elysia";

export const createArticlesController = (articlesService: ArticleService) =>
  new Elysia({ prefix: "/articles" })
    .model(schema)
    .get("/", ({ query }) => articlesService.list(query), {
      query: "findMany.request",
      response: "findMany.response",
    })
    .get(
      "/:id",
      async ({ params: { id } }) => {
        const result = await articlesService.detail(id);
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
        articlesService.edit(id, body);
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
