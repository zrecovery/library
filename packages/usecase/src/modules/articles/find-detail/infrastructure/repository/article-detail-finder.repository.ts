import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

import { Value } from "@sinclair/typebox/value";
import {
  ArticleDetailFinderErrorEnum,
  ArticleDetailResultPort,
  type ArticleDetailFinder,
} from "@articles/find-detail/port/deps/ArticleDetailFinder";

export class ArticleDetailFinderRepository implements ArticleDetailFinder {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback(): Promise<void> {
    this.#tx.rollback();
  }

  #format = (
    articles: {
      id: number;
      title: string | null;
      body: string | null;
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
        body: a.body,
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
  findDetailById = async (
    id: number,
  ): Promise<
    Result<ArticleDetailResultPort, TaggedError<ArticleDetailFinderErrorEnum>>
  > => {
    const article = await this.#tx
      .select({
        id: schema.library.id,
        title: schema.library.title,
        body: schema.library.body,
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
      .where(eq(schema.library.id, id))
      .limit(1);

    if (!article[0]) {
      return Err(
        new TaggedError("Not Found", ArticleDetailFinderErrorEnum.NotFound),
      );
    }
    try {
      const result = Value.Parse(
        ArticleDetailResultPort,
        this.#format(article)[0],
      );
      return Ok(result);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        return Err(
          new TaggedError(
            "类型匹配异常",
            ArticleDetailFinderErrorEnum.UnknownError,
            e.stack,
          ),
        );
      }
      return Err(
        new TaggedError(
          "类型匹配异常",
          ArticleDetailFinderErrorEnum.UnknownError,
          String(e),
        ),
      );
    }
  };
}
