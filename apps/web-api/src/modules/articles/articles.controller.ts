import {
  ArticleCreate,
  ArticleDetail,
  ArticleListResponse,
  ArticleQuery,
  type ArticleService,
  ArticleUpdate,
  type DomainError,
} from "backend";
import Elysia, { error, t } from "elysia";

const ArticleModel = new Elysia().model({
  "findMany.request": ArticleQuery,
  "findMany.response": ArticleListResponse,
  "find.response": ArticleDetail,
  "create.request": ArticleCreate,
  "update.request": ArticleUpdate,
});

export const createArticlesController = (articlesService: ArticleService) =>
  new Elysia({ prefix: "/articles" })
    .use(ArticleModel)
    .get("/", ({ query }) => articlesService.list(query), {
      query: "findMany.request",
      response: "findMany.response",
    })

    .get(
      "/:id",
      async ({ params: { id } }) => {
        const result = await articlesService.detail(id);
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case "NotFound":
              return error(404, "Not Found");

            default:
              return error(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: (val) => {
            return val;
          },
          err: (e) => handleError(e),
        });
      },
      {
        params: t.Object({ id: t.Numeric() }),
        response: {
          200: "find.response",
          404: t.String(),
          500: t.String(),
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
