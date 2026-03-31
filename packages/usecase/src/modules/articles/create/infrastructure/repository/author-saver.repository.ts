import {
  AuthorSaverErrorEnum,
  type AuthorSaver,
} from "@library/usecase/articles/create";
import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class AuthorSaverRepository implements AuthorSaver {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback = (): Promise<void> => {
    this.#tx.rollback();
  };
  save = async (data: {
    articleId: number;
    name: string;
  }): Promise<Result<number, TaggedError<"Unknown Error">>> => {
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
