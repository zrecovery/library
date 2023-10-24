import { type ArticleCreateDto } from '@app/dtos/article.dto';
import type { Article } from '@app/models/article.model';
import type { ArticlesRepositoryPort, Query } from '@app/usecases/article.usecase';
import { type PrismaClient } from '@prisma/client';

const LIMIT = 5;

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
                body: true,
                love: true,
                book_id: true,
                author_id: true
            },
            where: {
                id
            }
        });
    }

    public getList = async (query: Query, limit: number = LIMIT, offset = 0): Promise<Article[]> => {
        // 性能优化，先筛选出关键词包含的文章id, 然后根据id筛选出相关视图。
        const searchResult = await this.#client.article.findMany({
            select: {
                id: true
            },
            where: {
                love: query.love,
                article_content: {
                    contains: query.keywords
                }
            }
        })
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
                id: {
                    in: searchResult.map(article => article.id)
                }
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
                article_content: article.body,
                love: false
            }
        });

        return articleCreated.id;

    }

    public update = async (id: number, article: Article): Promise<void> => {
        const author = await this.#client.author.findFirst({
            where: {
                name: article.author
            }
        })
        const book = await this.#client.book.findFirst({
            where: {
                title: article.book,
                author_id: author?.id
            }
        })
        await this.#client.article.update({
            where: {
                id
            },
            data: {
                title: article.title,
                author_id: author?.id,
                serial_id: book?.id,
                serial_order: article.serial_order,
                article_content: article.body,
                love: article.love,

            }
        })
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
            select: {
                id: true,
                title: true,
                author: true,
                book: true,
                serial_order: true,
                body: true,
                love: true
            },
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


