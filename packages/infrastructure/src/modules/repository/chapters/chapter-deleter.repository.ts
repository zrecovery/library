import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ChapterDeleterRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  delete = async (
    articleId: number,
  ): Promise<Result<null, TaggedError<"Unknown Error" | "Not Found">>> => {
    const existing = await this.#db
      .select({ id: schema.chapters.id })
      .from(schema.chapters)
      .where(eq(schema.chapters.articleId, articleId))
      .limit(1);

    if (!existing[0]) {
      return Err(new TaggedError("Not Found", "Not Found" as const));
    }

    await this.#db
      .delete(schema.chapters)
      .where(eq(schema.chapters.articleId, articleId))
      .returning({ deletedId: schema.chapters.id });

    return Ok(null);
  };
}
