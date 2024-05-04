import { ArticleController } from "@src/controllers/article/article.controller";
import Elysia from "elysia";

const app = new Elysia();
app.use(
    ArticleController
)
app.get("/", (ctx) => "hi");
app.listen(3001);