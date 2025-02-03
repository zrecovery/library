import { cors } from "@elysiajs/cors";
import {
  createArticleService,
  createAuthorService,
  createChapterService,
} from "backend";
import { readConfig } from "backend/src/shared/domain/config";
import { Elysia } from "elysia";

import { createArticlesController } from "./src/modules/articles/articles.controller";
import { createAuthorController } from "./src/modules/authors/authors.controller";
import { createChapterController } from "./src/modules/chapters/chapters.controller";

const config = readConfig();
const articleService = createArticleService(config);
const articleController = createArticlesController(articleService);

const authorService = createAuthorService(config);
const authorController = createAuthorController(authorService);

const chapterService = createChapterService(config);
const chapterController = createChapterController(chapterService);

export const app = new Elysia()
  .use(cors())
  .group("/api", (api) =>
    api.use(articleController).use(authorController).use(chapterController),
  )
  .listen(3001);

export type Server = typeof app;
