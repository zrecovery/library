import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { eq, and, SQL, inArray } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";
import { Value } from "@sinclair/typebox/value";
import {
  ArticleListFinderErrorEnum,
  type ArticleListFinder,
  type QueryKeywords,
} from "@articles/find-list/port/deps/ArticleListlFinder";
import { ArticleListResultPort } from "@articles/find-list/port/type/findList";
import type { Pagination } from "@library/domain";

export class ArticleListRepository implements ArticleListFinder {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }

  #format = (
    articles: {
      id: number;
      title: string | null;
      chapter: {
        id: number | null;
        title: string | null;
        order: number | null;
      };
      author: {
        id: number | null;
        name: string | null;
      };
    }[],
  ) => {
    return articles.map((a) => {
      return {
        id: a.id,
        title: a.title,
        chapter:
          a.chapter.id === null
            ? undefined
            : {
                id: a.chapter.id,
                title: a.chapter.title,
                order: a.chapter.order,
              },
        author: a.author,
      };
    });
  };

  findList = async (
    pagination: Pagination,
    keywords?: QueryKeywords,
  ): Promise<
    Result<ArticleListResultPort, TaggedError<ArticleListFinderErrorEnum>>
  > => {
    try {
      const { page, size } = pagination;
      const offset = (page - 1) * size;
      if (page <= 0) {
        return Err(
          new TaggedError(
            "Page must be greater than 0",
            ArticleListFinderErrorEnum.NotFound,
          ),
        );
      }

      const articleIdResult = keywords
        ? (
            await this.#tx
              .select({
                articleId: schema.keywordIndexView.articleId,
              })
              .from(schema.keywordIndexView)
              .where(
                and(
                  keywords?.positive
                    ? inArray(schema.keywords.keyword, keywords.positive)
                    : undefined,
                  keywords?.negative
                    ? inArray(schema.keywords.keyword, keywords.negative)
                    : undefined,
                ),
              )
          ).map(({ articleId }) => articleId)
        : undefined;
      const keywordQueryCondition = keywords
        ? inArray(schema.library.id, articleIdResult)
        : undefined;

      const articleList = await this.#tx
        .select({
          id: schema.library.id,
          title: schema.library.title,
          chapter: {
            id: schema.library.chapterId,
            title: schema.library.chapterTitle,
            order: schema.library.chapterOrder,
          },
          author: {
            id: schema.library.authorId,
            name: schema.library.authorName,
          },
        })
        .from(schema.library)
        .where(keywordQueryCondition)
        .limit(size)
        .offset(offset);

      const queryResult = this.#format(articleList);
      const data = Value.Parse(ArticleListResultPort, {
        pagination: {
          current: page,
          size,
          pages: Math.ceil(queryResult.length / size),
          items: queryResult.length,
        },
        data: queryResult,
      });
      return Ok(data);
    } catch {
      return Err(
        new TaggedError(
          "数据库读取数据异常",
          ArticleListFinderErrorEnum.UnknownError,
        ),
      );
    }
  };

  rollback(): Promise<void> {
    this.#tx.rollback();
  }
}
