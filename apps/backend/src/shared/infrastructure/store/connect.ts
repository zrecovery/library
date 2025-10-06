import * as schema from "@shared/infrastructure/store/schema";
import { drizzle } from "drizzle-orm/bun-sql";
import type { Database } from "./db";

let dbInstance: Database | null = null;

export const connectDb = (uri: string): Database => {
  if (dbInstance) {
    return dbInstance;
  }

  if (!uri) {
    throw new Error("Database URI is required");
  }

  try {
    console.info("Connecting to database:", uri);

    dbInstance = drizzle(uri, { schema: schema, logger: true });
    console.info("Database connection established");
    return dbInstance;
  } catch (e) {
    console.error("Failed to connect to database:", e);
    throw new Error("Database connection failed");
  }
};
