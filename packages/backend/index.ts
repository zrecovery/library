import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import Elysia from "elysia";
import { articlesController } from "./src/application/article.controller.ts";

export const app = new Elysia()
  .use(swagger())
  .use(cors({ origin: "localhost:3000" }))
  .group("/api", (api) => api.use(articlesController))
  .listen(3001);

export type Server = typeof app;
