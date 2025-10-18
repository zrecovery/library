import type { Config } from "@shared/domain/config";
import { connectDbAsync, getConnectionState, disconnectDb } from "./connect";
import type { Database } from "./db";

/**
 * Database Manager that provides comprehensive database lifecycle management
 */
export class DatabaseManager {
  private config: Config;
  private dbInstance: Database | null = null;
  private isInitialized = false;

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.dbInstance = await connectDbAsync(this.config);
      this.isInitialized = true;
      console.info("Database manager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database manager:", error);
      throw error;
    }
  }

  /**
   * Get the database instance (synchronous, assumes initialization was called first)
   */
  getDb(): Database {
    if (!this.isInitialized || !this.dbInstance) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.dbInstance;
  }

  /**
   * Get the current connection state
   */
  getState(): ReturnType<typeof getConnectionState> {
    return getConnectionState();
  }

  /**
   * Check database health by running a simple query
   */
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    message?: string;
  }> {
    try {
      if (!this.dbInstance) {
        return { status: "unhealthy", message: "Database not connected" };
      }

      // Run a simple health check query
      await this.dbInstance.execute("SELECT 1 as health_check");

      return { status: "healthy" };
    } catch (error) {
      console.error("Database health check failed:", error);
      return {
        status: "unhealthy",
        message: `Health check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Perform a graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      disconnectDb();
      this.isInitialized = false;
      console.info("Database manager shut down successfully");
    } catch (error) {
      console.error("Error during database shutdown:", error);
      throw error;
    }
  }

  /**
   * Reconnect to the database
   */
  async reconnect(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }

  /**
   * Get database statistics (connection pool info, etc.)
   */
  getStats(): { initialized: boolean; connectionState: string } {
    return {
      initialized: this.isInitialized,
      connectionState: getConnectionState(),
    };
  }
}

// Singleton instance for easy access
let databaseManager: DatabaseManager | null = null;

export const getDatabaseManager = (config: Config): DatabaseManager => {
  if (!databaseManager) {
    databaseManager = new DatabaseManager(config);
  }
  return databaseManager;
};
