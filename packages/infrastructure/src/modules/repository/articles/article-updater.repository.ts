import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ArticleUpdaterRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  update = async (data: {
    id: number;
    title?: string;
    body?: string;
  }): Promise<Result<number, TaggedError<"Not Found" | "Unknown Error">>> => {
    if (!data.title && !data.body) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const [updated] = await this.#db
      .update(schema.articles)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(schema.articles.id, data.id))
      .returning({ updatedId: schema.articles.id });

    if (!updated) {
      return Err(new TaggedError("Not Found", "Not Found" as const));
    }

    return Ok(updated.updatedId);
  };
}
