import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createArticleService } from "../domain/article/article.service";
import { createArticleStore } from "../store/article";

const uri = process.env.DATABASE_URI;
if (uri === undefined) {
  throw new Error("No database uri provided");
}

const connectDb = (uri: string) => {
  if (!uri) {
    throw new Error("Database URI is required");
  }

  try {
    console.info("Connecting to database:", uri);
    const client = postgres(uri, {
      max: 10, // Connection pool size
      idle_timeout: 20,
      connect_timeout: 10,
    });

    const db = drizzle(client);
    console.info("Database connection established");
    return createArticleStore(db);
  } catch (e) {
    console.error("Failed to connect to database:", e);
    throw new Error("Database connection failed");
  }
};

const articleStore = connectDb(uri);
export const articlesService = createArticleService(articleStore);
