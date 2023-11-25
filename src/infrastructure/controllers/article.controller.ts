import type { ArticleService } from "@/core/article/article.service";
import type { Article } from "@/core/article/article.model";
import type { Query } from "@/core/article/article.repository";
import { type Context } from "elysia";
import { pagination } from "@/utils/pagination.util";
import { QueryResult } from "@/core/query-result.model";

export class ArticleController {
  constructor(readonly articleService: ArticleService) {}

  /**
   * Retrieves a list of articles based on the provided query parameters.
   * @param context - The request context containing the query parameters.
   * @returns A promise that resolves to an array of articles.
   */
  public list = async ({ query }: Context): Promise<QueryResult<Article[]>> => {
    const { page, size, keywords, love } = query;

    const { limit, offset } = pagination(page, size);

    const keywordQuery = keywords ? decodeURIComponent(keywords) : undefined;
    const loveStatus = love !== undefined ? Boolean(love) : undefined;

    const queryRequest: Query = {
      love: loveStatus,
      keyword: keywordQuery,
    };

    return this.articleService.getList(queryRequest, limit, offset);
  };

  /**
   * Retrieves an article by its ID.
   * @param params - The request params containing the article ID.
   * @returns A promise that resolves to the requested article.
   */
  public getById = async ({
    params: { id },
  }: {
    params: { id: string };
  }): Promise<Article> => {
    return this.articleService.getById(Number(id));
  };

  /**
   * Retrieves a list of articles based on the provided author ID.
   * @param context - The request context containing the author ID and query parameters.
   * @returns A promise that resolves to an array of articles.
   */
  public getByAuthorId = async (context: Context): Promise<Article[]> => {
    const { page, size } = context.query;
    const { id } = context.params;
    const { limit, offset } = pagination(page, size);
    return this.articleService.getByAuthorId(Number(id), limit, offset);
  };

  /**
   * Creates a new article.
   * @param context - The request context containing the article data.
   * @returns A promise that resolves when the article is created.
   */
  public create = async ({ body, set }: Context): Promise<void> => {
    await this.articleService.create(body as Article);
    set.status = "Created";
  };

  /**
   * Updates an existing article.
   * @param context - The request context containing the article ID, update data, and response set object.
   * @returns A promise that resolves when the article is updated.
   * @throws An error if the provided article ID is invalid.
   */
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

  /**
   * Deletes an article.
   * @param context - The request context containing the article ID and response set object.
   * @returns A promise that resolves when the article is deleted.
   */
  public delete = async ({
    params,
    set,
  }: Context<{ params: { id: string } }>): Promise<void> => {
    const { id } = params;
    await this.articleService.delete(Number(id));
    set.status = "No Content";
  };
}
