import { type ArticleCreateDto } from "@app/dtos/article.dto";
import { ArticleRepository } from "@app/repositories/articles.repository";
import { BookRepository } from "@app/repositories/books.repository";
import cors from "@koa/cors";
import { PrismaClient } from "@prisma/client";
import Application from 'koa';
import { koaBody } from "koa-body";
import Router from "koa-router";
import { AuthorRepository } from "./repositories/author.repository";

const app = new Application();

const articleRoute = new Router({ prefix: `/articles` });
const bookRoute = new Router({ prefix: `/books` });
const authorRoute = new Router({ prefix: `/authors` });
const LIMIT = 5;

app.use(cors());
app.use(koaBody());

interface Query {
    love?: boolean;
    keywords?: string;
}

const client = new PrismaClient({
    log: [
        {
            emit: `event`,
            level: `query`,
        },
        {
            emit: `stdout`,
            level: `error`,
        },
        {
            emit: `stdout`,
            level: `info`,
        },
        {
            emit: `stdout`,
            level: `warn`,
        },
    ],
});


client.$on(`query`, (e) => {
    console.log(`Query: ` + e.query);
    console.log(`Params: ` + e.params);
    console.log(`Duration: ` + e.duration + `ms`);
})

const articleRepository = new ArticleRepository(client);
const bookRepository = new BookRepository(client);
const authorRepository = new AuthorRepository(client)

bookRoute.get(`/`, async ctx => {
    const query = ctx.request.query;
    const limit = Number(query.limit ?? LIMIT);
    const offset = Number(query.page ?? 0) * limit - limit;
    if (query.title !== `` && query.author !== `` && typeof query.title === `string` && typeof query.author === `string`) {
        const articles = await bookRepository.getListByBookAndAuthor(query.title, query.author);
        ctx.body = articles;
    } else {
        const books = await bookRepository.getList(limit, offset);
        ctx.body = books;
    }
})

bookRoute.get(`/:id`, async ctx => {
    const query = ctx.request.query;
    const limit = Number(query.limit ?? LIMIT);
    const offset = Number(query.page ?? 1) * limit - limit;
    const id = Number(ctx.params.id);
    const articles = await bookRepository.getById(id, limit, offset);
    ctx.body = articles;
})

articleRoute.get(`/`, async ctx => {
    const query = ctx.request.query;
    const limit = Number(query.limit ?? LIMIT);
    const offset = Number(query.page ?? 1) * limit - limit;
    const love = query.love !== undefined ? Boolean(query.love) : undefined;
    function flatMapString(keywords: string | string[] | undefined): string | undefined {
        if (typeof keywords === `object`) {
            return keywords.reduce((a: string, b: string) => a + b);
        } else {
            return keywords;
        }
    }
    const keywords = query.keywords
    const articleQuery: Query = {
        love,
        keywords: flatMapString(keywords)
    }
    const articles = await articleRepository.getList(articleQuery, limit, offset)
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
        ctx.status = 204;
    } catch (error) {
        ctx.status = 500;
        throw (error);
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
        ctx.message = `添加失败`;
    }
})

articleRoute.put(`/:id`, async ctx => {
    try {
        const id = Number(ctx.params.id);
        const updatedArticle = await ctx.request.body;
        await articleRepository.update(id, updatedArticle)
        ctx.status = 204
    } catch (error) {
        console.error(error)
        ctx.status = 400;
    }
})

authorRoute.get(`/`, async ctx => {
    const query = ctx.request.query;
    const limit = Number(query.limit ?? LIMIT);
    const offset = Number(query.page ?? 1) * limit - limit;
    const authors = await authorRepository.getList(limit, offset);
    ctx.body = authors;
})

authorRoute.get(`/:id`, async ctx => {
    const query = ctx.request.query;
    const id = Number(ctx.params.id);
    const limit = Number(query.limit ?? LIMIT);
    const offset = Number(query.page ?? 1) * limit - limit;
    const books = await authorRepository.getBooksById(id, limit, offset)
    ctx.body = books;
})

app.use(bookRoute.routes());
app.use(articleRoute.routes());
app.use(authorRoute.routes());

app.listen(3001);
