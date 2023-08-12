import type { Article } from '../models/article.model';
import type { ArticlesRepositoryPort } from '../usecases/article.usecase';
import { PrismaClient } from '@prisma/client'

const LIMIT = 20;

export class ArticleRepository implements ArticlesRepositoryPort {

    #client: PrismaClient
    constructor() {
        this.#client = new PrismaClient();
    }

    async getByID(id: number): Promise<Article> {
        return await this.#client.article.findFirstOrThrow({
            where: {
                id
            }
        })
    }

    public getList = async (limit: number = LIMIT, offset = 0): Promise<Article[]> => {
        return await this.#client.article.findMany({
            orderBy: [{
                author: `asc`
            }, {
                serial_name: `asc`
            }, {
                serial_order: `asc`
            }],
            skip: offset,
            take: limit
        })
    }

    public create = async (article: Article): Promise<Article> => {
        return await this.#client.article.create({
            data: {
                title: article.title,
                author: article.author,
                serial_name: article.serial_name,
                serial_order: article.serial_order,
                article_content: article.article_content
            }
        })
    }

    public delete = async (id: number): Promise<Article> => {
        return await this.#client.article.delete({
            where: {
                id
            }
        })
    }

    public search = async (keywords: string[], limit: number = LIMIT, offset = 0): Promise<Article[]> => {
        const searchQuery = keywords.reduce((a, b) => {
            return a + `&` + b;
        });

        return await this.#client.article.findMany({
            where: {
                article_content: {
                    search: searchQuery,
                }
            },
            skip: offset,
            take: limit
        })
    }

    public getListByBookTitle = async (bookTitle: string, author: string): Promise<Article[]> => {
        return await this.#client.article.findMany({
            where: {
                serial_name: {
                    search: bookTitle
                },
                author
            },
            orderBy: {
                'serial_order': `asc`
            }
        })
    }
}


