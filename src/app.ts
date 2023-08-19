import { type ArticleCreateDto } from "./dtos/article.dto";
import { ArticleRepository } from "@app/repositories/articles.repository";
import { BookRepository } from "@app/repositories/books.repository";
import cors from "@koa/cors"
import { PrismaClient } from "@prisma/client";
import Application from 'koa';
import { koaBody } from "koa-body";
import Router from "koa-router";

const app = new Application();

const articleRoute = new Router({ prefix: `/articles` });
const bookRoute = new Router({ prefix: `/books` })

app.use(cors())
app.use(koaBody());

const client = new PrismaClient();

const articleRepository = new ArticleRepository(client);
const bookRepository = new BookRepository(client);

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
    const articleCreated = ctx.request.body as unknown as ArticleCreateDto;
    try {
        const result = await articleRepository.create(articleCreated);
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
