import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import type {
  ArticleDeleter,
  ArticleDeleterErrorEnum,
} from "@library/usecase/articles/delete";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ArticleDeleterRepository implements ArticleDeleter {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }

  // 删除article时会级联删除对应其他表
  delete = async (
    id: number,
  ): Promise<Result<number, TaggedError<ArticleDeleterErrorEnum>>> => {
    const existing = await this.#db
      .select({
        id: schema.library.id,
      })
      .from(schema.library)
      .where(eq(schema.library.id, id))
      .limit(1);

    if (!existing[0]) {
      return Err(new TaggedError("Not Found", "Not Found" as const));
    }
    existing;

    const [deleted] = await this.#db
      .delete(schema.articles)
      .where(eq(schema.articles.id, id))
      .returning({ deletedId: schema.articles.id });

    if (!deleted) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    return Ok(deleted.deletedId);
  };
}
