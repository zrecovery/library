import type { Article } from "@/core/article/article.model";
import type {
  ArticleRepository,
  Query,
} from "@/core/article/article.repository";
import { QueryResult } from "@/core/query-result.model";
import { Prisma, type PrismaClient } from "@prisma/client";
export class ArticlePrismaRepository implements ArticleRepository {
  readonly #client: PrismaClient;
  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getArticleById = async (id: number): Promise<Article> => {
    try {
      const articles = await this.#client.article
        .findFirstOrThrow({
          select: {
            id: true,
            title: true,
            body: true,
            love: true,
            author: {
              select: {
                name: true,
              },
            },
            Chapter: {
              select: {
                chapter_order: true,
                book: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          where: {
            id,
          },
        })
        .then((article) => {
          return {
            id: article.id,
            title: article.title,
            body: article.body,
            love: article.love,
            author: article.author.name,
            chapter_order: article.Chapter!.chapter_order,
            book: article.Chapter!.book.title,
          };
        });
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
    const article = await this.#client.article.findFirst({
      select: {
        id: true,
        Chapter: {
          select: {
            id: true,
            book_id: true,
          },
        },
      },
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
          book_id: article.Chapter?.book_id,
        },
      });

      if (!chapter) {
        await transaction.book.delete({
          where: {
            id: article.Chapter?.book_id,
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
  ): Promise<QueryResult<Article[]>> => {
    const { love, keyword } = query;
    const total = await this.#client.article.count({
      where: {
        love,
        body: {
          contains: keyword,
        },
      },
    });

    const articles = await this.#client.article
      .findMany({
        select: {
          id: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          title: true,
          body: true,
          love: true,
          Chapter: {
            select: {
              chapter_order: true,
              book_id: true,
              article_id: true,
              book: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        where: {
          love,
          body: {
            contains: keyword,
          },
        },
        skip: offset,
        take: limit,
      })
      .then((articles) => {
        return articles.map((article) => {
          return {
            id: article.id,
            title: article.title,
            author: article.author.name,
            book: article.Chapter!.book.title,
            chapter_order: article.Chapter!.chapter_order,
            body: article.body,
            love: article.love,
            author_id: article.author.id,
            book_id: article.Chapter!.book_id,
          };
        });
      });
    const result: QueryResult<Article[]> = {
      page: Math.ceil(total / limit),
      size: limit,
      current_page: offset / limit,
      detail: articles,
    };
    return result;
  };
}
