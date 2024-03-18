import { ArticleService } from "@src/core/article/article.service";
import type { Article } from "@src/core/article/article.model";
import type {
  ArticleRepository,
  Query,
} from "@src/core/article/article.repository";
import { t, type Context, Elysia } from "elysia";
import {
  ArticleCreatedDto,
  ArticleDto,
  ArticleEditDto,
  ResponseArrayResult,
  ResponseResult,
} from "./dto";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { ArticleEntity } from "@src/core/article/article.schema";

const listQuery = t.Object({
  page: t.Optional(t.Numeric()),
  size: t.Optional(t.Numeric()),
  keyword: t.Optional(t.String()),
});

const params = t.Object({ id: t.Numeric() });

const listResponse = ResponseArrayResult(t.Array(ArticleDto));
const singleResponse = ResponseResult(t.Object({ detail: ArticleDto }));

export class ArticleController {
  constructor(readonly articleService: ArticleService) {}

  list = async ({
    query,
  }: Context<{
    query: { page?: number; size?: number; keywords?: string; love?: boolean };
  }>): Promise<{
    title: string;
    type: string;
    data: QueryResult<ArticleEntity[]>;
  }> => {
    const { page, size, keywords, love } = query;

    const keywordQuery = keywords ? decodeURIComponent(keywords) : undefined;
    const loveStatus = love !== undefined ? Boolean(love) : undefined;

    const queryRequest: Query = {
      love: loveStatus,
      keyword: keywordQuery,
    };

    const result = await this.articleService.findList(queryRequest, {
      page: Number(page),
      size: Number(size),
    });
    return {
      title: "Article List",
      type: "success",
      data: result,
    };
  };

  public getById = async ({
    params: { id },
  }: Context<{ params: { id: number } }>): Promise<{
    title: string;
    type: string;
    data: QueryResult<ArticleEntity>;
  }> => {
    const result = await this.articleService.findById(id);
    return {
      title: "Article Find By ID",
      type: "success",
      data: result,
    };
  };

  public create = async ({ body, set }: Context): Promise<void> => {
    await this.articleService.create(body as Article);
    set.status = "Created";
  };

  public update = async ({
    params,
    set,
    body,
  }: Context<{ params: { id: number } }>): Promise<void> => {
    const { id } = params;
    const article = body as Article;
    if (id !== article.id) {
      throw new Error("Invalid id");
    }
    await this.articleService.update(article);
    set.status = "No Content";
  };

  public delete = async ({
    params,
    set,
  }: Context<{ params: { id: number } }>): Promise<void> => {
    const { id } = params;
    await this.articleService.delete(id);
    set.status = "No Content";
  };
}

export const articleModule = (repository: ArticleRepository): Elysia => {
  const articleService = new ArticleService(repository);
  const articleController = new ArticleController(articleService);
  return new Elysia()
    .get("/articles", articleController.list, {
      query: listQuery,
      response: listResponse,
    })
    .get("/articles/:id", articleController.getById, {
      params,
      response: singleResponse,
    })
    .post("/articles", articleController.create, {
      body: ArticleCreatedDto,
      response: { 201: t.Void() },
    })
    .put("/articles/:id", articleController.update, {
      params: params,
      body: ArticleEditDto,
      response: { 204: t.Void() },
    })
    .delete("/articles/:id", articleController.delete, { params: params });
};
