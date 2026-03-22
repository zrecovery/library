import type { Transaction } from "@shared/db";
import {
  ArticleSaverErrorEnum,
  type ArticleSaver,
} from "@library/usecase/articles/create";
import type { Rollbackable } from "@library/usecase/shared/rollbackable";

import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";
import * as schema from "@shared/schema";

export class ArticleSaverRepository implements ArticleSaver, Rollbackable {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback(): Promise<void> {
    return this.#tx.rollback();
  }
  save = async (data: {
    title: string;
    body: string;
  }): Promise<Result<number, TaggedError<"Not Found" | "Unknown Error">>> => {
    const result = await this.#tx
      .insert(schema.articles)
      .values({ title: data.title, body: data.body })
      .returning({ insertedId: schema.articles.id });
    const insertedId = result?.[0]?.insertedId;
    if (!insertedId) {
      return Err(
        new TaggedError("Unknown Error", ArticleSaverErrorEnum.UnknownError),
      );
    }
    return Ok(insertedId);
  };
}
