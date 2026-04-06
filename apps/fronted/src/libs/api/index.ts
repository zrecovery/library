import { treaty } from "@elysiajs/eden";
import type { App } from "@library/backend";
import type { ArticleCreatePort } from "@library/usecase";

export const api = treaty<App>("localhost:3001");

export const createArticle = async (articleCreated: ArticleCreatePort) => {
  return api.api.articles.post(articleCreated);
};
