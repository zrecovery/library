import {
  articles,
  authors,
  chapters,
} from "@shared/infrastructure/store/schema";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import type * as schema from "@shared/infrastructure/store/schema";
import type { Id } from "src/model";

export const remove =
  (db: PostgresJsDatabase<typeof schema>) => async (id: Id) => {
    return db.transaction(async (tx) => {
      try {
        await tx.delete(authors).where(eq(authors.article_id, id));
        await tx.delete(chapters).where(eq(chapters.article_id, id));
        await tx.delete(articles).where(eq(articles.id, id));
      } catch (e) {
        console.error(e);
        tx.rollback();
        throw e;
      }
    });
  };
