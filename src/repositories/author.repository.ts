import type { Article } from "@app/models/article.model";
import type { Author } from "@app/models/author.model";
import type { Book } from "@app/models/book.model";
import type { AuthorsRepositoryPort } from "@app/usecases/author.usecase";
import type { PrismaClient } from "@prisma/client";

const LIMIT = 20;

export class AuthorRepository implements AuthorsRepositoryPort {
    #client: PrismaClient;

    constructor(client: PrismaClient) {
        this.#client = client;
    }

    public getList = async (limit?: number | undefined, offset?: number | undefined): Promise<Author[]> => {

        return await this.#client.author.findMany({
            skip: offset,
            take: limit
        });
    }

    public getBooksById = async (id: number, limit: number = LIMIT, offset = 0): Promise<Book[]> => {

        const res = await this.#client.book.findMany({
            select: {
                id: true,
                title: true,
                author: {
                    select: {
                        name: true
                    }
                }
            },
            where: {
                author_id: id
            },
            skip: offset,
            take: limit
        });
        const books = res.flatMap(b => { return { id: b.id, title: b.title, author: b.author.name } })

        return books;
    }

    public getArticlesById = async (id: number, limit: number = LIMIT, offset = 0): Promise<Article[]> => {
        return await this.#client.articles_view.findMany({
            select: {
                id: true,
                title: true,
                author: true,
                author_id: true,
                book: true,
                book_id: true,
                serial_order: true,
                body: true,
                love: true
            },
            where: {
                author_id: id
            },
            orderBy: [{
                author: `asc`
            }, {
                book: `asc`
            }, {
                serial_order: `asc`
            }],
            skip: offset,
            take: limit
        });
    }
}
