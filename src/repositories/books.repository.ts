import type { Article } from "@app/models/article.model";
import type { Book } from "@app/models/book.model";
import type { BooksRepositoryPort } from "@app/usecases/book.usecase";
import type { PrismaClient } from "@prisma/client";

const LIMIT = 20;

export class BookRepository implements BooksRepositoryPort {
    #client: PrismaClient;

    constructor(client: PrismaClient) {
        this.#client = client;
    }

    public getById = async (id: number, limit?: number | undefined, offset?: number | undefined): Promise<Book[]> => {

        return await this.#client.articles_view.findMany({
            where: {
                book_id: id
            },
            orderBy: {
                serial_order: `asc`
            },
            skip: offset,
            take: limit
        });
    }

    public getList = async (limit: number = LIMIT, offset = 0): Promise<Book[]> => {

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
            skip: offset,
            take: limit
        });
        const books = res.flatMap(b => { return { id: b.id, title: b.title, author: b.author.name } })

        return books;
    }

    public getListByBookAndAuthor = async (book: string, author: string): Promise<Article[]> => {
        return await this.#client.articles_view.findMany({
            where: {
                book: {
                    search: book
                },
                author: {
                    search: author
                }
            },
            orderBy: {
                'serial_order': `asc`
            }
        });
    }
}
