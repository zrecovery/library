import { paginationToOffsetLimit } from "@src/utils/pagination.util";
import { Prisma, type PrismaClient } from "@prisma/client";
import { totalPaginationToPaging } from "@src/utils/totalPaginationToPaging";
import { ArticleRepository } from "./article.repository";
import { articleEntitySelect, queryArticle, queryToArticleEntity } from "./article.query";
import { StoreError } from "@src/infrastructure/prisma/StoreError";
import { ResponseDto } from "@src/modules/schema/query.response.schema";

export interface ChapterRepository {
  create(chapter: { articleId: number, bookId: number, order: number }): Promise<void>
}

export class ArticlePrismaRepository implements ArticleRepository {
  readonly #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  #getArticleById = async (id: number): Promise<queryArticle | null> => {
    return this.#client.article.findFirstOrThrow({
      select: articleEntitySelect,
      where: { id },
    });
  };


  public getById = async (id: number): Promise<ResponseDto<ArticleEntity>> => {
    try {
      const query = await this.#getArticleById(id);
      const article = queryToArticleEntity(query!);
      return {
        detail: article,
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2001") {
          throw new StoreError(`未找到文章：article id: ${id}`);
        }
      }
      throw e;
    }
  };

  public create = async (article: ArticleCreated): Promise<void> => {
    try {
      const author = await this.#basePrismaRepository.findAuthorOrCreate(
        article.author,
      );

      const book = await this.#basePrismaRepository.findBookOrCreate(
        article.book,
        author.id,
      );

      const articleCreated = await this.#client.article.create({
        data: {
          title: article.title,
          author_id: author.id,
          body: article.body,
          love: false,
        },
      });
      await this.#basePrismaRepository.createChapter({
        article_id: articleCreated.id,
        order: article.order,
        book_id: book.id,
      });

      await this.#client.search.create({
        data: {
          rowid: articleCreated.id,
          title: articleCreated.title,
          body: articleCreated.body,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case "P2002":
            throw new StoreError("未找到");
            break;
          default:
            throw e.code;
        }
      } else {
        throw e;
      }
    }
  };

  public update = async (article: ArticleUpdated): Promise<void> => {
    try {
      const author = await this.#basePrismaRepository.findAuthorOrCreate(
        article.author,
      );
      const book = await this.#basePrismaRepository.findBookOrCreate(
        article.book,
        author.id,
      );

      await this.#client.article.update({
        where: {
          id: article.id,
        },
        data: {
          title: article.title,
          body: article.body,
          love: article.love,
          author_id: author.id,
        },
      });

      await this.#client.chapter.update({
        where: {
          article_id: article.id,
        },
        data: {
          book_id: book.id,
          chapter_order: article.order,
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
    try {
      const article =
        await this.#basePrismaRepository.getArticleById(articleId);

      await this.#client.$transaction(async (transaction) => {
        await transaction.chapter.delete({
          where: {
            article_id: articleId,
          },
        });

        await transaction.article.delete({
          where: {
            id: articleId,
          },
        });

        // 检测指定书籍id下面是否存在文章，如果没有就删除书籍。
        const chapter = await transaction.chapter.findFirst({
          where: {
            book_id: article.chapter!.book.id,
          },
        });

        if (!chapter) {
          await transaction.book.delete({
            where: {
              id: article.chapter!.book.id,
            },
          });
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new StoreError("文章不存在");
      }
    }
  };

  public search = async (
    query: Query,
    pagination: Pagination,
  ): Promise<QueryResult<ArticleEntity[]>> => {
    const { limit, offset } = paginationToOffsetLimit(pagination);
    const { love, keyword } = query;

    const count = await this.#client.search.count({
      where: {
        body: {
          contains: keyword,
        },
      },
    });

    const paging = totalPaginationToPaging(count, pagination);

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

    const articles = await this.#client.article
      .findMany({
        select: articleEntitySelect,
        where: {
          id: {
            in: ids.map((id) => id.rowid),
          },
        },
      })
      .then((articles) => {
        return articles.map(queryToArticleEntity);
      });

    const result: QueryResult<ArticleEntity[]> = {
      paging,
      detail: articles,
    };
    return result;
  };
}
