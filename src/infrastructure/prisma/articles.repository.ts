import type { Article } from "@/core/article/model/article.model";
import type {
  ArticleRepository,
  Query,
} from "@/core/article/repository/ArticleRepository";
import { type PrismaClient } from "@prisma/client";
export class ArticlePrismaRepository implements ArticleRepository {
  readonly #client: PrismaClient;
  constructor(client: PrismaClient) {
    this.#client = client;
  }

  async getArticleById(id: number): Promise<Article> {
    const article = await this.#client.articles_view_shadow.findFirstOrThrow({
      where: {
        id,
      },
    });
    return article;
  }

  public getArticlesByAuthorId = async (
    id: number,
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
    const articles = await this.#client.articles_view_shadow.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        author_id: true,
        book: true,
        book_id: true,
        chapter_order: true,
        body: true,
        love: true,
      },
      where: {
        author_id: id,
      },
      orderBy: [
        {
          author: "asc",
        },
        {
          book: "asc",
        },
        {
          chapter_order: "asc",
        },
      ],
      skip: offset,
      take: limit,
    });
    return articles;
  };

  public getArticles = async (
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
    const articles = await this.#client.articles_view_shadow.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        author_id: true,
        book: true,
        book_id: true,
        chapter_order: true,
        body: true,
        love: true,
      },
      orderBy: [
        {
          author: "asc",
        },
        {
          book: "asc",
        },
        {
          chapter_order: "asc",
        },
      ],
      skip: offset,
      take: limit,
    });
    return articles;
  };

  public createArticle = async (article: Article): Promise<void> => {
    const authorByQuery = await this.#client.author.findFirstOrThrow({
      select: {
        id: true,
      },
      where: {
        name: article.author,
      },
    });

    await this.#client.article.create({
      data: {
        title: article.title,
        author_id: authorByQuery.id,
        body: article.body,
        love: false,
      },
    });
  };

  public updateArticle = async (article: Article): Promise<void> => {
    const author = await this.#client.author.findFirst({
      where: {
        name: article.author,
      },
    });
    await this.#client.article.update({
      where: {
        id: article.id,
      },
      data: {
        title: article.title,
        author_id: author?.id,
        body: article.body,
        love: article.love,
      },
    });
  };

  public deleteArticle = async (id: number): Promise<void> => {
    await this.#client.article.delete({
      where: {
        id,
      },
    });
  };

  public searchArticles = async (
    query: Query,
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
    const { love, keyword } = query;

    const articleByQuery = await this.#client.article.findMany({
      select: {
        id: true,
      },
      where: {
        love,
        body: {
          contains: keyword,
        },
      },
      skip: offset,
      take: limit,
    });

    return await this.#client.articles_view_shadow.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        book: true,
        chapter_order: true,
        body: true,
        love: true,
        book_id: true,
        author_id: true,
      },
      where: {
        id: {
          in: articleByQuery.map((article) => article.id),
        },
      },
    });
  };
}
