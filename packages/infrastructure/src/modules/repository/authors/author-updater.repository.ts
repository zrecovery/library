import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class AuthorUpdaterRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  update = async (data: {
    articleId: number;
    name: string;
  }): Promise<Result<number, TaggedError<"Unknown Error">>> => {
    const existingAuthor = await this.#db
      .select({ id: schema.authors.id })
      .from(schema.authors)
      .where(eq(schema.authors.articleId, data.articleId))
      .limit(1);

    if (!existingAuthor[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const authorId = existingAuthor[0].id;
    const author = await this.#db
      .select({ personId: schema.authors.personId })
      .from(schema.authors)
      .where(eq(schema.authors.id, authorId))
      .limit(1);

    if (!author[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const [updated] = await this.#db
      .update(schema.people)
      .set({ name: data.name, updatedAt: new Date().toISOString() })
      .where(eq(schema.people.id, author[0].personId))
      .returning({ updatedId: schema.people.id });

    if (!updated) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    return Ok(authorId);
  };
}
