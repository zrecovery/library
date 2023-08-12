import { Article } from "@app/models/article.model";
import { ArticleRepository } from "@app/repositories/articles.repository";
import { BookRepository } from "@app/repositories/books.repository";
import * as cors from "@koa/cors"
import * as Koa from "koa";
import { koaBody } from "koa-body";
import * as Router from "koa-router";

const app = new Koa();

const articleRoute = new Router({ prefix: `/articles` });
const bookRoute = new Router({ prefix: `/books` })

app.use(cors())
app.use(koaBody());

const articleRepository = new ArticleRepository();
const bookRepository = new BookRepository();

bookRoute.get(`/`, async ctx => {
    const query = ctx.request.query
    const limit = Number(query.limit ?? `20`)
    const offset = Number(query.page ?? 0) * limit - limit
    if (query.title !== `` && query.author !== `` && typeof query.title === `string` && typeof query.author === `string`) {
        const articles = await articleRepository.getListByBookTitle(query.title, query.author);
        ctx.body = articles;
    } else {
        const books = await bookRepository.getList(limit, offset);
        ctx.body = books;
    }
})

articleRoute.get(`/`, async ctx => {
    const query = ctx.request.query
    const limit = Number(query.limit ?? `20`)
    const offset = Number(query.page ?? 0) * limit - limit
    const articles = await articleRepository.getList(limit, offset);
    ctx.body = articles;
})

articleRoute.get(`/:id`, async ctx => {
    const id = Number(ctx.params.id);
    const article = await articleRepository.getByID(id);
    ctx.body = article;
})

articleRoute.delete(`/:id`, async ctx => {
    try {
        const id = Number(ctx.params.id);
        await articleRepository.delete(id);
    } catch (error) {
        ctx.status = 500;
        throw (error)
    }
})


articleRoute.post(`/`, async ctx => {
    const article = ctx.request.body;
    try {
        const result = await articleRepository.create(article);
        ctx.body = result;
        ctx.status = 201;
        ctx.message = `添加成功`;
    } catch (error) {
        console.error(error)
        ctx.status = 500;
        ctx.message = `添加失败`
    }
})

app.use(bookRoute.routes())
app.use(articleRoute.routes())


app.listen(3001);
