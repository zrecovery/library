import { treaty } from "@elysiajs/eden";
import type { App } from "@library/backend";
import type { Id, Pagination } from "@library/domain";
import type { ArticleCreatePort } from "@library/usecase";

export const server = treaty<App>("localhost:3001");

export const createArticle = async (articleCreated: ArticleCreatePort) => {
  return server.api.articles.post(articleCreated);
};

export const getArticleDetail = async (id: Id) => {
  return server.api.articles({ id: id }).get();
};

export const getArticleList = async (query?: {
  pagination?: Pagination;
  keywords?: string;
}) => {
  return server.api.articles.get({
    query: {
      size: query?.pagination?.size,
      page: query?.pagination?.page,
      keywords: query?.keywords,
    },
  });
};
