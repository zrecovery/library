import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import type { TaggedError } from "tag-error";

export class SearchDeleterRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  delete = async (
    id: number,
  ): Promise<Result<null, TaggedError<"Unknown Error">>> => {
    await this.#db
      .delete(schema.articleKeywords)
      .where(eq(schema.articleKeywords.articleId, id))
      .returning({ deletedId: schema.articleKeywords.id });

    return Ok(null);
  };
}
