import type { Article } from "@/core/article/article.model";
import type {
  ArticleRepository,
  Query,
} from "@/core/article/article.repository";
import { Prisma, type PrismaClient } from "@prisma/client";
export class ArticlePrismaRepository implements ArticleRepository {
  readonly #client: PrismaClient;
  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getArticleById = async (id: number): Promise<Article> => {
    try {
      const articles = await this.#client.articles_view_shadow.findFirstOrThrow(
        {
          where: {
            id,
          },
        },
      );
      return articles;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === "P2001") {
          console.warn("未找到文章");
        }
      }
      throw e;
    }
  };

  public getArticlesByAuthorId = async (
    id: number,
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
    return this.#client.articles_view_shadow.findMany({
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
  };

  public getArticles = async (
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
    return this.#client.articles_view_shadow.findMany({
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
  };

  public createArticle = async (article: Article): Promise<void> => {
    try {
      await this.#client.$transaction(async (prisma) => {
        const author = await prisma.author.findFirstOrThrow({
          select: {
            id: true,
          },
          where: {
            name: article.author,
          },
        });

        let book = await prisma.book.findFirst({
          where: {
            title: article.book,
            author_id: author.id,
          },
        });

        if (!book) {
          book = await prisma.book.create({
            data: {
              title: article.book,
              author_id: author.id,
            },
          });
        }

        const articleCreated = await prisma.article.create({
          data: {
            title: article.title,
            author_id: author.id,
            body: article.body,
            love: false,
          },
        });

        await prisma.chapter.create({
          data: {
            chapter_order: article.chapter_order,
            book_id: book.id,
            article_id: articleCreated.id,
          },
        });
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case "P2002":
            if (e.code === "P2002") {
              console.warn(e.message);
            }
            break;
        }    
      }
      throw e;
    }
  };

  public updateArticle = async (article: Article): Promise<void> => {
    try {
      const author = await this.#client.author.findFirstOrThrow({
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
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case "P2001":
            console.warn(e.message);
            break;
        }
      }
      throw e;
    }
  };

  public deleteArticle = async (articleId: number): Promise<void> => {
    const article = await this.#client.articles_view_shadow.findFirst({
      where: {
        id: articleId,
      },
    });

    if (!article) {
      throw new Error("Article not found");
    }

    await this.#client.$transaction(async (transaction) => {
      await transaction.chapter.deleteMany({
        where: {
          article_id: articleId,
        },
      });

      await transaction.article.delete({
        where: {
          id: articleId,
        },
      });

      const chapter = await transaction.chapter.findFirst({
        where: {
          book_id: article.book_id,
        },
      });

      if (!chapter) {
        await transaction.book.delete({
          where: {
            id: article.book_id,
          },
        });
      }
    });
  };

  /**
   * Search articles based on the given query.
   * @param query - The search query object.
   * @param limit - The maximum number of articles to return.
   * @param offset - The offset to start fetching articles from (default: 0).
   * @returns An array of articles that match the search criteria.
   */
  public searchArticles = async (
    query: Query,
    limit: number,
    offset = 0,
  ): Promise<Article[]> => {
    const { love, keyword } = query;

    const articles = await this.#client.articles_view_shadow.findMany({
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
        love,
        body: {
          contains: keyword,
        },
      },
      skip: offset,
      take: limit,
    });

    return articles;
  };
}
