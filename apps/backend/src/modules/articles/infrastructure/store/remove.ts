import {
  articles,
  authors,
  chapters,
} from "@shared/infrastructure/store/schema";
import { eq } from "drizzle-orm";

import type { Remover } from "@articles/domain";
import { type Id, UnknownError } from "@shared/domain";
import type { Database } from "@shared/infrastructure/store/db";
import { Err, Ok } from "result";

export class DrizzleRemover implements Remover {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  remove = async (id: Id) => {
    await this.#db.transaction(async (tx) => {
      try {
        await tx.delete(authors).where(eq(authors.article_id, id));
        await tx.delete(chapters).where(eq(chapters.article_id, id));
        await tx.delete(articles).where(eq(articles.id, id));
      } catch (e) {
        tx.rollback();
        if (e instanceof Error) {
          return Err(new UnknownError(`Delete article ${id}`, e));
        }
        return Err(new UnknownError(`Delete article ${id} failed: ${e}`));
      }
    });
    return Ok(null);
  };
}
