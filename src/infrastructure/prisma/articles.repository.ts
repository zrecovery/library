import type { Article } from "@src/core/article/article.model";
import type {
  ArticleRepository,
  Query,
} from "@src/core/article/article.repository";
import { Pagination } from "@src/core/schema/pagination.schema";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { paginationToEntity } from "@src/utils/pagination.util";
import { Prisma, type PrismaClient } from "@prisma/client";

export class ArticlePrismaRepository implements ArticleRepository {
  readonly #client: PrismaClient;
  constructor(client: PrismaClient) {
    this.#client = client;
  }

  public getById = async (id: number): Promise<QueryResult<Article>> => {
    try {
      const article = await this.#client.article
        .findFirstOrThrow({
          select: {
            id: true,
            title: true,
            body: true,
            love: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            chapters: {
              select: {
                chapter_order: true,
                book: {
                  select: {
                    id: true,
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
            author: article.author.name,
            author_id: article.author.id,
            order: article.chapters[0].chapter_order,
            book: article.chapters[0].book.title,
            book_id: article.chapters[0].book.id,
            love: article.love
          };
        });
      return {
        detail: article
      };
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

  public create = async (article: Article): Promise<void> => {
    try {
      await this.#client.$transaction(async (prisma) => {
        let author = await prisma.author.findFirst({
          select: {
            id: true,
          },
          where: {
            name: article.author,
          },
        });

        if (!author) {
          author = await prisma.author.create({
            data: {
              name: article.author,
            },
          });
        }

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
            chapter_order: Number(article.order),
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

  public update = async (article: Article): Promise<void> => {
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

  public delete = async (articleId: number): Promise<void> => {
    const article = await this.#client.article.findFirst({
      select: {
        id: true,
        chapters: {
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
          book_id: article.chapters[0].book_id,
        },
      });

      if (!chapter) {
        await transaction.book.delete({
          where: {
            id: article.chapters[0].book_id,
          },
        });
      }
    });
  };

  public search = async (
    query: Query,
    pagination: Pagination
  ): Promise<QueryResult<Article[]>> => {
    const { limit, offset } = paginationToEntity(pagination);
    const { love, keyword } = query;

    const c = await this.#client.search.count({
      where: {
        body: {
          contains: keyword,
        },
      },
    });

    const ids = await this.#client.search.findMany({
      select: {
        rowid: true,
      },
      where: {
        body: {
          contains: keyword,
        },
      },
      take: limit,
      skip: offset,
    });

    const total = Number(c);

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
          chapters: {
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
          id: {
            in: ids.map((id) => id.rowid),
          },
        },
      })
      .then((articles) => {
        return articles.map((article) => {
          return {
            id: article.id,
            title: article.title,
            author: article.author.name,
            book: article.chapters[0].book.title,
            order: article.chapters[0].chapter_order,
            body: article.body,
            love: article.love,
            author_id: article.author.id,
            book_id: article.chapters[0].book_id,
          };
        });
      });

    const result: QueryResult<Article[]> = {
      paging: {
        total: Math.ceil(total / limit),
        size: limit,
        page: offset / limit,
      },
      detail: articles,
    };
    return result;
  };
}
