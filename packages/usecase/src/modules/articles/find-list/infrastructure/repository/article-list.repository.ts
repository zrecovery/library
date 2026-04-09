import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { and, count, inArray, SQL } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";
import { Value } from "@sinclair/typebox/value";
import {
  ArticleListFinderErrorEnum,
  type ArticleListFinder,
  type QueryKeywords,
} from "@articles/find-list/port/deps/ArticleListlFinder";
import { ArticleListResultPort } from "@articles/find-list/port/type/findList";
import { PaginationResponse, type Pagination } from "@library/domain";

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

  #queryArticlesByKeyword = async (keywords: QueryKeywords) => {
    return (
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
    ).map(({ articleId }) => articleId);
  };

  #queryItemsWithoutKeyword = async (condition?: SQL) => {
    const result = await this.#tx
      .select({
        items: count(schema.library.id),
      })
      .from(schema.library)
      .where(condition);
    return {
      items: result[0].items,
      condition: condition,
    };
  };

  #queryArticlesList = async (
    pagination: { offset: number; limit: number },
    condition?: SQL,
  ) => {
    const { offset, limit } = pagination;
    return this.#tx
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
      .where(condition)
      .limit(limit)
      .offset(offset);
  };
  #countPagination = (
    size: number,
    items: number,
    current: number,
  ): PaginationResponse => {
    return {
      size,
      current,
      items,
      pages: items / size,
    };
  };

  #checkResultType = (
    articles: unknown,
    pagination: PaginationResponse,
  ): Result<ArticleListResultPort, TaggedError<ArticleListFinderErrorEnum>> => {
    try {
      const data = Value.Parse(ArticleListResultPort, {
        pagination: pagination,
        data: articles,
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

  #queryArticlesIdByKeywords = async (keywords: QueryKeywords) => {
    const articleIdResult = await this.#queryArticlesByKeyword(keywords);
    return {
      items: articleIdResult.length,
      condition: inArray(schema.library.id, articleIdResult),
    };
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

      //根据是否有关键词查询，分为2类情况；
      // 一种有关键词，查询满足带关键词的文章，并返回数量并构造查询条件；
      // 另一种无关键词，直接查询数量，并返回查询条件；
      const { items, condition } = keywords
        ? await this.#queryArticlesIdByKeywords(keywords)
        : await this.#queryItemsWithoutKeyword();

      const articleList = await this.#queryArticlesList(
        { limit: size, offset },
        condition,
      );
      const queryResult = this.#format(articleList);
      return this.#checkResultType(
        queryResult,
        this.#countPagination(size, items, page),
      );
    } catch(e) {

      console.error(e)
      return Err(
        new TaggedError(
          "数据库读取数据异常",
          ArticleListFinderErrorEnum.UnknownError,
          e.stack
        ),
      );
    }
  };

  rollback(): Promise<void> {
    this.#tx.rollback();
  }
}
