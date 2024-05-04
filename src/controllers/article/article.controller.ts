import { t, Elysia } from "elysia";
import { ArticleDetailSchema, ArticlePaginatedHttpDto } from "./article.controller.dto";
import { articleService } from "@src/application/ioc.service";
import { ResponseSchema } from "../response.schema";

const ArticleModel = new Elysia({ name: "Model.Article" })
  .model({
    "article.id": t.Object({ id: t.Numeric() }),
    "article.findById": ResponseSchema(ArticleDetailSchema),
    "article.list-query": t.Object({
      page: t.Optional(t.Numeric()),
      size: t.Optional(t.Numeric()),
      keywords: t.Optional(t.Array(t.String())),
    }),
    "article.list": ArticlePaginatedHttpDto
  })
export const ArticleController = new Elysia()
  .decorate({
    ArticleService: articleService,
  })
  .use(ArticleModel)
  .group("/articles", (app) =>
    app.get(
      "/:id",
      async ({ ArticleService, params }) => {
        const result = await ArticleService.findById(params.id);
        return result;
      },
      {
        params: "article.id",
        response: "article.findById",
      },
    )
      .get(
        "/",
        async ({ ArticleService, query }) => {
          const result = await ArticleService.search(query);
          return result;
        },
        {
          query: "article.list-query",
          response: "article.list",
        },
      )
  );