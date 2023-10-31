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
    return await this.#client.articles_view.findFirstOrThrow({
      where: {
        id,
      },
    });
  }

  public getArticlesByAuthorId = async (
    id: number,
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
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
          serial_order: "asc",
        },
      ],
      skip: offset,
      take: limit,
    });
  };

  public getArticles = async (
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
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
          serial_order: "asc",
        },
      ],
      skip: offset,
      take: limit,
    });
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

    const serialByQuery = await this.#client.book.findFirstOrThrow({
      select: {
        id: true,
      },
      where: {
        title: article.book,
      },
    });

    await this.#client.article.create({
      data: {
        title: article.title,
        author_id: authorByQuery.id,
        serial_id: serialByQuery.id,
        serial_order: article.serial_order,
        article_content: article.body,
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
    const book = await this.#client.book.findFirst({
      where: {
        title: article.book,
        author_id: author?.id,
      },
    });
    await this.#client.article.update({
      where: {
        id: article.id,
      },
      data: {
        title: article.title,
        author_id: author?.id,
        serial_id: book?.id,
        serial_order: article.serial_order,
        article_content: article.body,
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
        article_content: {
          contains: keyword,
        },
      },
      skip: offset,
      take: limit,
    });

    return await this.#client.articles_view.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        book: true,
        serial_order: true,
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
