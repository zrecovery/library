import * as schema from "@shared/infrastructure/store/schema";
import { drizzle } from "drizzle-orm/bun-sql";
import type { Database } from "./db";
import type { Config } from "@shared/domain/config";
import { defaultLogger } from "@shared/utils";

// Global database instance for singleton pattern
let dbInstance: Database | null = null;
let connectionState: "disconnected" | "connected" | "error" = "disconnected";

/**
 * Enhanced database connection function with proper configuration handling
 * Maintains the same synchronous interface for compatibility while adding enhanced functionality.
 */
export const connectDb = (config: Config): Database => {
  const { database: dbConfig } = config;

  if (!dbConfig.URI) {
    throw new Error("Database URI is required");
  }

  // If we already have a connected instance, return it
  if (connectionState === "connected" && dbInstance) {
    return dbInstance;
  }

  try {
    defaultLogger.info(`Connecting to database: ${dbConfig.URI}`);

    // Create the database instance with the URI and configuration
    // Note: The bun-sql adapter doesn't support connection pooling natively,
    // but the configuration can be enhanced for other adapters if needed
    dbInstance = drizzle(dbConfig.URI, {
      schema: schema,
      logger: dbConfig.enableLogging ?? true,
    });

    connectionState = "connected";
    defaultLogger.info("Database connection established successfully");

    return dbInstance;
  } catch (error) {
    defaultLogger.error(
      `Database connection failed: ${(error as Error).message}`,
    );
    connectionState = "error";
    throw new Error(`Database connection failed: ${(error as Error).message}`);
  }
};

// Enhanced async connection function with retry logic (can be used during app startup)
export const connectDbAsync = async (config: Config): Promise<Database> => {
  const { database: dbConfig } = config;

  if (!dbConfig.URI) {
    throw new Error("Database URI is required");
  }

  // If we already have a connected instance, return it
  if (connectionState === "connected" && dbInstance) {
    return dbInstance;
  }

  defaultLogger.info(`Connecting to database: ${dbConfig.URI}`);

  let lastError: Error | null = null;

  // Attempt connection with retry logic
  for (let attempt = 0; attempt <= (dbConfig.retryAttempts || 1); attempt++) {
    try {
      // Create the database instance with the URI and configuration
      const newDbInstance = drizzle(dbConfig.URI, {
        schema: schema,
        logger: dbConfig.enableLogging ?? true,
      });

      // Test the connection by running a simple query
      await newDbInstance.execute("SELECT 1");

      dbInstance = newDbInstance;
      connectionState = "connected";

      defaultLogger.info("Database connection established successfully");
      return dbInstance;
    } catch (error) {
      lastError = error as Error;
      defaultLogger.error(
        `Database connection attempt ${attempt + 1} failed: ${(error as Error).message}`,
      );

      // If we're not on the last attempt, wait before retrying
      if (attempt < (dbConfig.retryAttempts || 1)) {
        const delay = (dbConfig.retryDelay || 1000) * Math.pow(2, attempt); // Exponential backoff
        defaultLogger.info(`Retrying connection in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retry attempts have failed
  connectionState = "error";
  throw new Error(
    `Database connection failed after ${(dbConfig.retryAttempts || 1) + 1} attempts: ${lastError?.message || "Unknown error"}`,
  );
};

// Connection state management
export const getConnectionState = (): typeof connectionState => connectionState;

// Graceful disconnection function
export const disconnectDb = (): void => {
  if (dbInstance) {
    // Note: bun-sql doesn't have explicit disconnect, but we can reset our internal state
    dbInstance = null;
    connectionState = "disconnected";
    defaultLogger.info("Database connection disconnected");
  }
};
