import type { Database } from "@shared/db";
import {
  ArticleSaverErrorEnum,
  CreateArticleUseCase,
  type ArticleSaver,
} from "@library/usecase/articles/create";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";
import * as schema from "@shared/schema";

export class ArticleSaverRepository implements ArticleSaver {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  save = async (data: {
    title: string;
    body: string;
  }): Promise<Result<number, TaggedError<"Not Found" | "Unknown Error">>> => {
    const result = await this.#db
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
