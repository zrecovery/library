import { createArticlesController } from "@article/infrastructure/http/article.controller";
import { createArticleService } from "@article/application/article.service";

const articlesService = createArticleService();

const articleController = createArticlesController(articlesService);

export const articleModule = {
  serivces: articlesService,
  controller: articleController,
};
