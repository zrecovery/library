import type { Rollbackable } from "@library/usecase/shared/rollbackable";
import type { Transaction } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import type { TaggedError } from "tag-error";

export class SearchDeleterRepository implements Rollbackable {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback = (): Promise<void> => {
    this.#tx.rollback();
  };
  delete = async (
    id: number,
  ): Promise<Result<null, TaggedError<"Unknown Error">>> => {
    await this.#tx
      .delete(schema.articleKeywords)
      .where(eq(schema.articleKeywords.articleId, id))
      .returning({ deletedId: schema.articleKeywords.id });

    return Ok(null);
  };
}
