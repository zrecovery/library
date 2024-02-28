import type { ArticleService } from "@src/core/article/article.service";
import type { Article } from "@src/core/article/article.model";
import type { Query } from "@src/core/article/article.repository";
import { t, type Context } from "elysia";
import { Get, Post, Put, Delete } from "@src/utils/route.util";
import BaseController, { type Route } from "@src/utils/BaseController";
import { ArticleCreatedDto, ArticleDto, ArticleEditDto, ResponseResult } from "./dto";

const listQuery = t.Object({
  page: t.Optional(t.Numeric()),
  size: t.Optional(t.Numeric()),
  keyword: t.Optional(t.String())
});

const params = t.Object({ id: t.Numeric() });

const listResponse = ResponseResult(t.Array(ArticleDto));
const singleResponse = ResponseResult(t.Object({ detail: ArticleDto }));

export class ArticleController extends BaseController {
  routes: Route[] = []
  constructor(readonly articleService: ArticleService) {
    super("/articles");
  }

  @Get("/", { query: listQuery, response: listResponse })
  list = async ({ query }: Context) => {

    const { page, size, keywords, love } = query;

    const keywordQuery = keywords ? decodeURIComponent(keywords) : undefined;
    const loveStatus = love !== undefined ? Boolean(love) : undefined;

    const queryRequest: Query = {
      love: loveStatus,
      keyword: keywordQuery,
    };

    const result = await this.articleService.findList(queryRequest, { page: Number(page), size: Number(size) });
    return {
      title: "Article List",
      type: "success",
      data: {
        detail: result
      }
    }
  };

  @Get("/:id", { params: params,  response: singleResponse })
  public getById = async ({
    params: { id },
  }: {
    params: { id: number };
  }) => {
    const result = await this.articleService.findById(id);
    return {
      title: "Article Find By ID",
      type: "success",
      data: result
    };
  }

  @Post("/", { body: ArticleCreatedDto, response: { 201: t.Void() } })
  public create = async ({ body, set }: Context): Promise<void> => {
    await this.articleService.create(body as Article);
    set.status = "Created";
  };

  @Put("/:id", { params: params, body: ArticleEditDto, response: { 204: t.Void() } })
  public update = async ({
    params,
    set,
    body,
  }: Context<{ params: { id: string } }>): Promise<void> => {
    const { id } = params;
    const article = body as Article;
    if (id !== String(article.id)) {
      throw new Error("Invalid id");
    }
    await this.articleService.update(article);
    set.status = "No Content";
  };

  @Delete("/:id", { params: params, response: { 204: t.Void() } })
  public delete = async ({
    params,
    set,
  }: Context<{ params: { id: string } }>): Promise<void> => {
    const { id } = params;
    await this.articleService.delete(Number(id));
    set.status = "No Content";
  };
}
