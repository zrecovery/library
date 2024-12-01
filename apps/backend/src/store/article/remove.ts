import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Id } from "../../domain/model";
import { articles, authors, chapters } from "../scheme";

export const remove = (db: PostgresJsDatabase) => async (id: Id) => {
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
