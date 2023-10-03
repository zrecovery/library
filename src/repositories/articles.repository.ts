import { type ArticleCreateDto } from '@app/dtos/article.dto';
import type { Article } from '@app/models/article.model';
import type { ArticlesRepositoryPort } from '@app/usecases/article.usecase';
import { type PrismaClient } from '@prisma/client';

const LIMIT = 20;

export class ArticleRepository implements ArticlesRepositoryPort {

    #client: PrismaClient;
    constructor(client: PrismaClient) {
        this.#client = client;
    }

    async getByID(id: number): Promise<Article> {
        return await this.#client.articles_view.findFirstOrThrow({
            select: {
                id: true,
                title: true,
                author: true,
                book: true,
                serial_order: true,
                body: true
            },
            where: {
                id
            }
        });
    }

    public getList = async (limit: number = LIMIT, offset = 0): Promise<Article[]> => {
        return await this.#client.articles_view.findMany({
            select: {
                id: true,
                title: true,
                author: true,
                book: true,
                serial_order: true,
                body: true
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
    };

    public create = async (article: ArticleCreateDto): Promise<number> => {
        const authorId = await this.#client.author.findFirstOrThrow({
            select: {
                id: true
            },
            where: {
                name: article.author
            }
        });

        const serialId = await this.#client.book.findFirstOrThrow({
            select: {
                id: true
            },
            where: {
                title: article.book
            }
        });

        const articleCreated = await this.#client.article.create({
            data: {
                title: article.title,
                author_id: authorId.id,
                serial_id: serialId.id,
                serial_order: article.serial_order,
                article_content: article.body
            }
        });

        return articleCreated.id;

    }

    public delete = async (id: number): Promise<void> => {
        await this.#client.article.delete({
            where: {
                id
            }
        });
    }

    public search = async (keywords: string[], limit: number = LIMIT, offset = 0): Promise<Article[]> => {
        const searchQuery = keywords.reduce((a, b) => {
            return a + `&` + b;
        });

        return await this.#client.articles_view.findMany({
            where: {
                body: {
                    search: searchQuery,
                }
            },
            skip: offset,
            take: limit
        })
    }
}


