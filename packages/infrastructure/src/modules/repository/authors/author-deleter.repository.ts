import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class AuthorDeleterRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  delete = async (
    articleId: number,
  ): Promise<Result<number, TaggedError<"Unknown Error">>> => {
    const existing = await this.#db
      .select({ id: schema.authors.id })
      .from(schema.authors)
      .where(eq(schema.authors.articleId, articleId))
      .limit(1);

    if (!existing[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const authorId = existing[0].id;
    const author = await this.#db
      .select({ personId: schema.authors.personId })
      .from(schema.authors)
      .where(eq(schema.authors.id, authorId))
      .limit(1);

    if (!author[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    await this.#db
      .delete(schema.authors)
      .where(eq(schema.authors.id, authorId))
      .returning({ deletedId: schema.authors.id });

    await this.#db
      .delete(schema.people)
      .where(eq(schema.people.id, author[0].personId))
      .returning({ deletedId: schema.people.id });

    return Ok(authorId);
  };
}
