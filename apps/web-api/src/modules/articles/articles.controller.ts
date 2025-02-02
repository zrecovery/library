import {
  ArticleCreate,
  ArticleDetail,
  ArticleListResponse,
  type ArticleService,
  ArticleUpdate,
  type DomainError,
  DomainErrorTag,
} from "backend";
import Elysia, { error, t } from "elysia";

const ArticleModel = new Elysia().model({
  "findMany.request": t.Object({
    page: t.Optional(t.Numeric({ minimum: 0, default: 1 })),
    size: t.Optional(t.Numeric({ minimum: 0, default: 10 })),
    keywords: t.Optional(t.String()),
  }),
  "findMany.response": ArticleListResponse,
  "find.response": ArticleDetail,
  "create.request": ArticleCreate,
  "update.request": ArticleUpdate,
});

export const createArticlesController = (articlesService: ArticleService) =>
  new Elysia({ prefix: "/articles" })
    .use(ArticleModel)
    .get(
      "/",
      async ({ query }) => {
        const result = await articlesService.list(query);
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return error(404, "Not Found");
            case DomainErrorTag.Invalidation:
              return error(400, "Bad Request");
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
        // Todo: 由于Elysia的Bug，在使用标签的情况下，无法将文本数字转化为数字，只能重复内嵌
        query: t.Object({
          page: t.Optional(t.Numeric({ minimum: 0, default: 1 })),
          size: t.Optional(t.Numeric({ minimum: 0, default: 10 })),
          keywords: t.Optional(t.String()),
        }),
        response: {
          200: "findMany.response",
          400: t.String(),
          404: t.String(),
          500: t.String(),
        },
      },
    )
    .get(
      "/:id",
      async ({ params: { id } }) => {
        const result = await articlesService.detail(id);
        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
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
      async ({ params: { id }, set }) => {
        const result = await articlesService.remove(id);

        const handleError = (err: DomainError) => {
          switch (err._tag) {
            case DomainErrorTag.NotFound:
              return error(404, "Not Found");

            default:
              return error(500, "Internal Server Error");
          }
        };
        return result.match({
          ok: (val) => {
            set.status = "No Content";
            return val;
          },
          err: (e) => handleError(e),
        });
      },
      {
        params: t.Object({ id: t.Numeric() }),
        response: {
          204: t.Null(),
          404: t.String(),
        },
      },
    );
