import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./scheme";

export const connectDb = (uri: string) => {
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

    const db = drizzle(client, { schema: schema });
    console.info("Database connection established");
    return db;
  } catch (e) {
    console.error("Failed to connect to database:", e);
    throw new Error("Database connection failed");
  }
};

