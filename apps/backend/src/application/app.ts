import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { ArticleController } from "@src/controllers/article/article.controller";
import { SeriesController } from "@src/controllers/series/series.controller";
import Elysia from "elysia";
import { staticPlugin } from '@elysiajs/static'

const app = new Elysia()
  .use(staticPlugin({ "assets": "out", "prefix": "/" }))
  .use(swagger())
  .use(cors({ origin: /.*\/localhost:5173$/ }))
  .get("/", () => Bun.file('index.html'))
  .group("/api", (api) => api.use(ArticleController).use(SeriesController))
  .listen(3001);

export type Server = typeof app;
