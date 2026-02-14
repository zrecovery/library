import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import type { Config } from "src/shared/domain/config";
import { defaultLogger, LogLevel } from "src/shared/utils";
import type { Database } from "./db";
import * as schema from "./schema";

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
    defaultLogger.log(LogLevel.Info, `Connecting to database: ${dbConfig.URI}`);

    // Create postgres client
    const client = new SQL({
      url: dbConfig.URI,
      max: dbConfig.pool?.maxConnections || 10,
      idle_timeout: (dbConfig.pool?.idleTimeout || 60000) / 1000,
      connect_timeout: (dbConfig.pool?.connectTimeout || 10000) / 1000,
    });

    // Create the database instance with the client and configuration
    dbInstance = drizzle({
      client: client,
      schema: schema,
      logger: dbConfig.enableLogging ?? true,
    });

    connectionState = "connected";
    defaultLogger.log(
      LogLevel.Info,
      "Database connection established successfully",
    );

    return dbInstance;
  } catch (error) {
    defaultLogger.log(
      LogLevel.Error,
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

  defaultLogger.log(LogLevel.Info, `Connecting to database: ${dbConfig.URI}`);

  let lastError: Error | null = null;

  // Attempt connection with retry logic
  for (let attempt = 0; attempt <= (dbConfig.retryAttempts || 1); attempt++) {
    try {
      // Create postgres client
      console.log(`Connecting to database: ${dbConfig.URI}`);
      const client = new SQL({
        url: dbConfig.URI,
        max: dbConfig.pool?.maxConnections || 10,
        idle_timeout: (dbConfig.pool?.idleTimeout || 60000) / 1000,
        connect_timeout: (dbConfig.pool?.connectTimeout || 10000) / 1000,
      });

      // Create the database instance with the client and configuration
      const newDbInstance = drizzle(client, {
        schema: schema,
        logger: dbConfig.enableLogging ?? true,
      });

      // Test the connection by running a simple query
      await newDbInstance
        .select({ test: schema.authors.id })
        .from(schema.authors)
        .limit(1);

      dbInstance = newDbInstance;
      connectionState = "connected";

      defaultLogger.log(
        LogLevel.Info,
        "Database connection established successfully",
      );
      return dbInstance;
    } catch (error) {
      lastError = error as Error;
      defaultLogger.log(
        LogLevel.Error,
        `Database connection attempt ${attempt + 1} failed: ${(error as Error).message}`,
      );

      // If we're not on the last attempt, wait before retrying
      if (attempt < (dbConfig.retryAttempts || 1)) {
        const delay = (dbConfig.retryDelay || 1000) * 2 ** attempt; // Exponential backoff
        defaultLogger.log(
          LogLevel.Info,
          `Retrying connection in ${delay}ms...`,
        );
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
    defaultLogger.log(LogLevel.Info, "Database connection disconnected");
  }
};
