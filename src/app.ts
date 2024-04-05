import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { articleModule } from "./modules/article/article.module";

const app = new Elysia();

app.use(swagger());
app.use(
  cors({
    origin: /.*\/localhost:5173$/,
  }),
);

const articleController = articleModule();
app.use(articleController);

app.listen(3001);
