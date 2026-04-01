import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";
import {
  ArticleDetailResultPort,
  ArticleDetailFinderErrorEnum,
  type ArticleDetailFinder,
} from "@library/usecase/articles/find-detail";
import { Value } from "@sinclair/typebox/value";

export class ArticleDetailFinderRepository implements ArticleDetailFinder {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback(): Promise<void> {
    this.#tx.rollback();
  }
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
      .where(eq(schema.library.id, id))
      .limit(1);

    if (!article[0]) {
      return Err(
        new TaggedError("Not Found", ArticleDetailFinderErrorEnum.NotFound),
      );
    }
    try {
      const result = Value.Parse(ArticleDetailResultPort, article[0]);
      return Ok(result);
    } catch (e) {
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
