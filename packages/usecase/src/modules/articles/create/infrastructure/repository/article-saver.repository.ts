import {
  type ArticleSaver,
  ArticleSaverErrorEnum,
} from "@articles/create/port/deps/ArticleSaver";
import type { Rollbackable } from "@library/usecase/shared/rollbackable";
import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { Value } from "@sinclair/typebox/value";

import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ArticleSaverRepository implements ArticleSaver, Rollbackable {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback = async (): Promise<void> => {
    try {
      this.#tx.rollback();
    } catch (e) {
      if (e instanceof Error && e.message !== "Rollback") {
        throw e;
      }
    }
  };
  save = async (data: {
    title: string;
    body: string;
  }): Promise<Result<number, TaggedError<ArticleSaverErrorEnum>>> => {
    const isArticleValid = Value.Check(schema.insertArticleSchema, data);
    if (!isArticleValid) {
      return Err(
        new TaggedError("Invalid Input", ArticleSaverErrorEnum.InvalidInput),
      );
    }

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
