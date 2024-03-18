import { articleFactory } from "./application/factory/article.factory";
import { AuthorFactory } from "./application/factory/author.factory";
import { bookFactory } from "./application/factory/book.factory";

import { Elysia } from "elysia";
import { clientFactory } from "./application/factory/client.factory";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { ArticleMockRepository } from "./infrastructure/mock/article.mock.repository";
import {
  ArticleController,
  articleModule,
} from "./infrastructure/controllers/article.controller";
import { ArticleService } from "./core/article/article.service";

const app = new Elysia();

app.use(swagger());
app.use(
  cors({
    origin: /.*\/localhost:5173$/,
  }),
);

const client = clientFactory();
const mockRespotory = new ArticleMockRepository();
const mockServer = new ArticleService(mockRespotory);
const articleController = new ArticleController(mockServer);
const a = articleModule(mockRespotory);
app.use(a);

app.listen(3001);
