import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createArticleService } from "../domain/article/article.service";
import { createArticleStore } from "../store/article";

const uri = process.env.DATABASE_URI;
if (uri === undefined) {
  throw new Error("No database uri provided");
}

const connectDb = (uri: string) => {
  try {
    console.log(uri);
    const client = postgres(uri);
    const db = drizzle(client);
    return createArticleStore(db);
  } catch (e) {
    console.error(e);
  }
};

const articleStore = connectDb(uri);
export const articlesService = createArticleService(articleStore);
