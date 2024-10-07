import { createArticleStore } from "../store/article";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { createArticleService } from "../domain/article/article.service";

const uri = process.env.DATABASE_URI;
if (uri === undefined) {
  throw new Error("No database uri provided");
}
const client = postgres(uri);
const db = drizzle(client);
const articleStore = createArticleStore(db);

export const articlesService = createArticleService(articleStore);
