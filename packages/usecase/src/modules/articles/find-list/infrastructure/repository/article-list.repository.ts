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
import type { Pagination } from "@library/domain/common";

export class ArticleListRepository implements ArticleListFinder {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }

  findList = async (
    pagination: Pagination,
    keywords?: QueryKeywords,
  ): Promise<
    Result<ArticleListResultPort, TaggedError<ArticleListFinderErrorEnum>>
  > => {
    const { page, size } = pagination;
    const offset = (page - 1) * size;
    if (page > 0) {
      return Err(
        new TaggedError(
          "Page must be greater than 0",
          ArticleListFinderErrorEnum.NotFound,
        ),
      );
    }
    const articleIdResult = (
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

    const articleList = await this.#tx
      .select({
        id: schema.library.id,
        title: schema.library.title,
        chapter: {
          id: schema.library.seriesId,
          title: schema.library.seriesTitle,
          order: schema.library.chapterOrder,
        },
        author: {
          id: schema.library.authorId,
          name: schema.library.peopleName,
        },
      })
      .from(schema.library)
      .where(inArray(schema.library.id, articleIdResult))
      .limit(size)
      .offset(offset);

    const data = Value.Parse(ArticleListResultPort, {
      pagination: {
        current: page,
        size,
        pages: Math.ceil(articleIdResult.length / size),
        items: articleIdResult.length,
      },
      data: articleList,
    });
    return Ok(data);
  };

  rollback(): Promise<void> {
    this.#tx.rollback();
  }
}
