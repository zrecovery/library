import {
  ChapterDeleterErrorEnum,
  type ChapterDeleter,
} from "@library/usecase/articles/delete";
import type { Database, Transaction } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ChapterDeleterRepository implements ChapterDeleter {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback = () => {
    this.#tx.rollback();
  };
  delete = async (
    articleId: number,
  ): Promise<Result<null, TaggedError<ChapterDeleterErrorEnum>>> => {
    const existing = await this.#tx
      .select({ id: schema.chapters.id })
      .from(schema.chapters)
      .where(eq(schema.chapters.articleId, articleId))
      .limit(1);

    if (!existing[0]) {
      return Err(
        new TaggedError("Not Found", ChapterDeleterErrorEnum.NotFound),
      );
    }

    await this.#tx
      .delete(schema.chapters)
      .where(eq(schema.chapters.articleId, articleId))
      .returning({ deletedId: schema.chapters.id });

    return Ok(null);
  };
}
