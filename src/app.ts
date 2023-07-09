import * as Koa from "koa";
import * as Router from "koa-router";
import { koaBody } from "koa-body";
import * as cors from "@koa/cors"

import { getArticleByID, getArticles, createArticle } from "./model/articles";
const app = new Koa();

const articleRoute = new Router({ prefix: "/articles" });

app.use(cors())
app.use(koaBody());
articleRoute.get("/", async ctx => {
    const query = ctx.request.query
    const limit = query.limit ? Number(query.limit) : 20
    const offset = Number(query.page) * limit
    const articles = await getArticles(limit, offset);
    ctx.body = articles;
})

articleRoute.get("/:id", async ctx => {
    const id = Number(ctx.params["id"]);
    const article = await getArticleByID(id);
    ctx.body = article;
})

articleRoute.post("/", async ctx => {
    const article = ctx.request.body
    const result = await createArticle(article);
    ctx.body = result;
})

app.use(articleRoute.routes())


app.listen(3000);
