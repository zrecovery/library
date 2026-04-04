import {
  AuthorSaverErrorEnum,
  type AuthorSaver,
} from "@articles/create/port/deps/AuthorSaver";
import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { insertPersonSchema } from "@shared/infrastructure/repostiory/schema";
import { Value } from "@sinclair/typebox/value";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class AuthorSaverRepository implements AuthorSaver {
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
    articleId: number;
    name: string;
  }): Promise<Result<number, TaggedError<AuthorSaverErrorEnum>>> => {
    const isPersonValid = Value.Check(insertPersonSchema, { name: data.name });
    if (!isPersonValid) {
      return Err(
        new TaggedError(
          "Invalid Input About Person",
          AuthorSaverErrorEnum.InvalidInput,
        ),
      );
    }
    const [person] = await this.#tx
      .insert(schema.people)
      .values({ name: data.name })
      .returning({ insertedId: schema.people.id });
    const personId = person?.insertedId;
    if (!personId) {
      return Err(
        new TaggedError("Unknown Error", AuthorSaverErrorEnum.UnknownError),
      );
    }
    const [author] = await this.#tx
      .insert(schema.authors)
      .values({ personId, articleId: data.articleId })
      .returning({ insertedId: schema.authors.id });
    const insertedId = author?.insertedId;
    if (!insertedId) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }
    return Ok(insertedId);
  };
}
