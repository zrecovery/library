import * as schema from "@shared/infrastructure/store/schema";
import { drizzle } from "drizzle-orm/bun-sql";
import type { Database } from "./db";

export const connectDb = (uri: string): Databasese => {
  if (!uri) {
    throw new Error("Database URI is required");
  }

  try {
    console.info("Connecting to database:", uri);

    const db = drizzle(uri, { schema: schema, logger: true });
    console.info("Database connection established");
    return db;
  } catch (e) {
    console.error("Failed to connect to database:", e);
    throw new Error("Database connection failed");
  }
};
