import { swagger } from "@elysiajs/swagger";
import { createArticleService } from "backend";
import { Elysia } from "elysia";
import { createArticlesController } from "./src/modules/articles/articles.controller";

const articleService = createArticleService();
const articleController = createArticlesController(articleService);

export const app = new Elysia()
  .group("/api", (api) => api.use(articleController))
  .listen(3001);

export type Server = typeof app;
