import { LIMIT } from "@/config";
import type ArticleService from "@/core/article/article.service";
import type { Article } from "@/core/article/model/article.model";
import type { Query } from "@/core/article/repository/ArticleRepository";
import type { Context } from "elysia";

export class ArticleController {
  constructor(readonly articleService: ArticleService) {}

  public list = async ({ query }: Context): Promise<Article[]> => {
    const { page, size, keywords, love } = query;
    const limit = size !== undefined ? Number(size) : LIMIT;
    const count = page !== undefined ? Number(page) : 1;
    const offset = count * limit;
    const keywordQuery =
      keywords !== null ? `${decodeURIComponent(keywords)}` : undefined;
    console.log(keywordQuery);
    const loveStatus = love !== undefined ? Boolean(love) : undefined;
    const queryRequest: Query = {
      love: loveStatus,
      keyword: keywordQuery,
    };
    return await this.articleService.getList(queryRequest, limit, offset);
  };

  public getById = async ({
    params: { id },
  }: {
    params: { id: string };
  }): Promise<Article> => {
    const article = await this.articleService.getById(Number(id));
    return article;
  };

  public getByAuthorId = async (context: Context): Promise<Article[]> => {
    const { page, size } = context.query;
    const { id } = context.params;
    const limit = size !== undefined ? Number(size) : LIMIT;
    const count = page !== undefined ? Number(page) : 1;
    const offset = count * limit;
    return await this.articleService.getByAuthorId(Number(id), limit, offset);
  };

  public create = async ({ body, set }: Context): Promise<void> => {
    await this.articleService.create(body as Article);
    set.status = "Created";
  };

  public update = async (context: Context): Promise<void> => {
    const { id } = context.params;
    const { body } = context;
    const set = context.set;
    const article = body as Article;
    if (id !== String(article.id)) {
      throw new Error("Invalid id");
    }
    await this.articleService.update(article);
    set.status = "No Content";
  };

  public delete = async (context: Context): Promise<void> => {
    const { id } = context.params;
    const set = context.set;
    await this.articleService.delete(Number(id));
    set.status = "No Content";
  };
}
