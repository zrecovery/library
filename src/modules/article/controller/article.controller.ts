import { ArticleService } from "@modules/article/domain/article.service";
import type { Query } from "@modules/article/repository/article.repository";
import { t, type Context, Elysia } from "elysia";
import { ArticleCreatedProps, ArticlePaginatedResponse, ArticleResponse, ArticleUpdatedProps } from "../schema/article.schema";
import { ArticleCreatedRequestDto, ArticleEditRequestDto, ArticleHttpDto, ArticlePaginatedHttpDto } from "./article.controller.dto";

const listQuery = t.Object({
  page: t.Optional(t.Numeric()),
  size: t.Optional(t.Numeric()),
  keyword: t.Optional(t.String()),
  love: t.Optional(t.Boolean())
});

const params = t.Object({ id: t.Numeric() });


export class ArticleRestController {
  constructor(readonly articleService: ArticleService) { }

  list = async ({
    query,
  }: Context<{
    query: { page?: number; size?: number; keywords?: string; love?: boolean };
  }>): Promise<{
    title: string;
    type: string;
    data: ArticlePaginatedResponse;
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
    data: ArticleResponse;
  }> => {
    const result = await this.articleService.findById(id);
    return {
      title: "Article Find By ID",
      type: "success",
      data: result,
    };
  };

  public create = async ({ body, set }: Context): Promise<void> => {
    await this.articleService.create(body as ArticleCreatedProps);
    set.status = "Created";
  };

  public update = async ({
    params,
    set,
    body,
  }: Context<{ params: { id: number } }>): Promise<void> => {
    const { id } = params;
    const article = body as ArticleUpdatedProps;
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

export const articleRestController = (articleService: ArticleService): Elysia => {
  const articleController = new ArticleRestController(articleService);
  return new Elysia()
    .get("/articles", articleController.list, {
      query: listQuery,
      response: ArticlePaginatedHttpDto,
    })
    .get("/articles/:id", articleController.getById, {
      params,
      response: ArticleHttpDto,
    })
    .post("/articles", articleController.create, {
      body: ArticleCreatedRequestDto,
      response: { 201: t.Void() },
    })
    .put("/articles/:id", articleController.update, {
      params: params,
      body: ArticleEditRequestDto,
      response: { 204: t.Void() },
    })
    .delete("/articles/:id", articleController.delete, { params: params });
};
