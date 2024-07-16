import { articleService } from "@src/application/ioc.service";
import { Elysia, t } from "elysia";
import { ResponseSchema } from "../response.schema";
import {
  ArticleDetailSchema,
  ArticlePaginatedHttpDto,
} from "./article.controller.dto";

const ArticleModel = new Elysia({ name: "Model.Article" }).model({
  "article.id": t.Object({ id: t.Numeric() }),
  "article.findById": ResponseSchema(ArticleDetailSchema),
  "article.list-query": t.Optional(t.Object({
    page: t.Optional(t.Numeric()),
    size: t.Optional(t.Numeric()),
    //Todo: Elysia don't handle optional string now.
    //keywords: t.Optional(t.String()),
  })),
  "article.list": ArticlePaginatedHttpDto,
});

export const ArticleController = new Elysia()
  .decorate({
    ArticleService: articleService,
  })
  .use(ArticleModel)
  .group("/articles", (app) =>
    app
      .get(
        "/:id",
        async ({ ArticleService, params }) => {
          return ArticleService.findById(params.id);
        },
        {
          params: "article.id",
          response: "article.findById",
        },
      )
      .get(
        "/",
        async ({ ArticleService, query }) => {
          const res = ArticleService.search(query);
          console.log(res);
          return res;
        },
        {
          query: "article.list-query",
          response: "article.list",
        },
      ),
  );
