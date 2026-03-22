import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class SearchHandlerRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  index = async (
    content: string,
  ): Promise<Result<null, TaggedError<"Unknown Error">>> => {
    const keywords = content.split(/\s+/).filter(Boolean);
    for (const keyword of keywords) {
      const [existing] = await this.#db
        .insert(schema.keywords)
        .values({ keyword })
        .onConflictDoNothing()
        .returning({ insertedId: schema.keywords.id });
      if (!existing) {
        const existingKeyword = await this.#db
          .select({ id: schema.keywords.id })
          .from(schema.keywords)
          .where(sql`${schema.keywords.keyword} = ${keyword}`)
          .limit(1);
        if (!existingKeyword[0]) {
          return Err(
            new TaggedError("Unknown Error", "Unknown Error" as const),
          );
        }
      }
    }
    return Ok(null);
  };
}
