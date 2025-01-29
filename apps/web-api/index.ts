import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { createArticleService } from "backend";
import { readConfig } from "backend/src/shared/domain/config";
import { Elysia } from "elysia";
import { createArticlesController } from "./src/modules/articles/articles.controller";

const config = readConfig();
const articleService = createArticleService(config);
const articleController = createArticlesController(articleService);

export const app = new Elysia()
  .use(swagger())
  .use(cors())
  .group("/api", (api) => api.use(articleController))
  .listen(3001);

export type Server = typeof app;
