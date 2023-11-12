import type {ArticleService} from "@/core/article/article.service";
import type { Article } from "@/core/article/article.model";
import type { Query } from "@/core/article/article.repository";
import { type Context } from "elysia";
import { config } from "@/application/configure";

export class ArticleController {
  constructor(readonly articleService: ArticleService) { }

  public list = async ({ query }: Context): Promise<Article[]> => {
    const { page, size, keywords, love } = query;
    const limit = size !== undefined ? Number(size) : config.LIMIT;
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
    return this.articleService.getList(queryRequest, limit, offset);
  };

  public getById = async ({
    params: { id },
  }: {
    params: { id: string };
  }): Promise<Article> => {
    return this.articleService.getById(Number(id));
  };

  public getByAuthorId = async (context: Context): Promise<Article[]> => {
    const { page, size } = context.query;
    const { id } = context.params;
    const limit = size !== undefined ? Number(size) : LIMIT;
    const count = page !== undefined ? Number(page) : 1;
    const offset = count * limit;
    return this.articleService.getByAuthorId(Number(id), limit, offset);
  };

  public create = async ({ body, set }: Context): Promise<void> => {
    await this.articleService.create(body as Article);
    set.status = "Created";
  };

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

  public delete = async ({
    params,
    set,
  }: Context<{ params: { id: string } }>): Promise<void> => {
    const { id } = params;
    await this.articleService.delete(Number(id));
    set.status = "No Content";
  };
}
