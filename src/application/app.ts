import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { ArticleController } from "@src/controllers/article/article.controller";
import { SeriesController } from "@src/controllers/series/series.controller";
import Elysia from "elysia";

const app = new Elysia();
app.use(swagger());
app.use(
  cors({
    origin: /.*\/localhost:5173$/,
  }),
);
app.group("/api", (api) => api.use(ArticleController).use(SeriesController));

app.get("/", () => "hi");

app.listen(3001);
