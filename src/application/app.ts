import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { ArticleController } from "@src/controllers/article/article.controller";
import { SeriesController } from "@src/controllers/series/series.controller";
import Elysia from "elysia";

const app = new Elysia()
  .use(swagger())
  .use(cors({ origin: /.*\/localhost:5173$/ }))
  .group("/api", (api) => api.use(ArticleController).use(SeriesController))
  .get("/", () => "hi")
  .listen(3001);

export type App = typeof app;
