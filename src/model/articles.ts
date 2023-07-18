import { Article, PrismaClient } from '@prisma/client'

const client = new PrismaClient();
const LIMIT = 20

export const getArticleByID = async (id: number): Promise<Article> => {
    return await client.article.findFirstOrThrow({
        where: {
            id: id
        }
    })
}

export const getArticles = async (limit: number = LIMIT, offset: number = 0): Promise<Article[]> => {
    return await client.article.findMany({
        orderBy: [{
            author: 'asc'
        }, {
            serial_name: 'asc'
        }, {
            serial_order: 'asc'
        }],
        skip: offset,
        take: limit
    })
}

export const createArticle = async (article: Article) => {
    return await client.article.create({
        data: {
            title: article.title,
            author: article.author,
            serial_name: article.serial_name,
            serial_order: article.serial_order,
            article_content: article.article_content
        }
    })
}

export const deleteArticle = async (id: number) => {
    return await client.article.delete({
        where: {
            id: id
        }
    })
}

export const searchArticles = async (keywords: string[], limit: number = LIMIT, offset: number = 0): Promise<Article[]> => {
    const searchQuery = keywords.reduce((a, b) => {
        return a + "&" + b;
    }) as string;

    return await client.article.findMany({
        where: {
            article_content: {
                search: searchQuery,
            }
        },
        skip: offset,
        take: limit
    })
}
