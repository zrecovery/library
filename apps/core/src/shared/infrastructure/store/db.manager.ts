import type { Config } from "src/shared/domain/config";
import { defaultLogger, LogLevel } from "src/shared/utils";
import { createDatabaseConnection } from "./db.factory";

type DatabaseClient = unknown;

export class DatabaseManager {
  private config: Config;
  private dbClient: DatabaseClient | null = null;
  private isInitialized = false;

  constructor(config: Config) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const connection = createDatabaseConnection(this.config);
      const result = await connection.connectAsync(this.config);

      if (result.isErr()) {
        throw result.unwrapErr();
      }

      this.dbClient = result.unwrap();
      this.isInitialized = true;

      defaultLogger.log(
        LogLevel.Info,
        `Database manager initialized: ${this.config.database.type}`,
      );
    } catch (error) {
      defaultLogger.log(
        LogLevel.Error,
        `Failed to initialize database manager: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  getDb(): DatabaseClient {
    if (!this.isInitialized || !this.dbClient) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.dbClient;
  }

  getState(): string {
    const connection = createDatabaseConnection(this.config);
    return connection.getConnectionState();
  }

  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    message?: string;
  }> {
    try {
      if (!this.dbClient) {
        return { status: "unhealthy", message: "Database not connected" };
      }

      const db = this.dbClient as {
        execute: (sql: string) => Promise<unknown>;
      };
      await db.execute("SELECT 1");

      return { status: "healthy" };
    } catch (error) {
      defaultLogger.log(
        LogLevel.Error,
        `Database health check failed: ${(error as Error).message}`,
      );
      return {
        status: "unhealthy",
        message: `Health check failed: ${(error as Error).message}`,
      };
    }
  }

  async shutdown(): Promise<void> {
    try {
      const connection = createDatabaseConnection(this.config);
      connection.disconnect();
      this.isInitialized = false;
      defaultLogger.log(
        LogLevel.Info,
        "Database manager shut down successfully",
      );
    } catch (error) {
      defaultLogger.log(
        LogLevel.Error,
        `Error during database shutdown: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    await this.shutdown();
    await this.initialize();
  }

  getStats(): { initialized: boolean; connectionState: string } {
    const connection = createDatabaseConnection(this.config);
    return {
      initialized: this.isInitialized,
      connectionState: connection.getConnectionState(),
    };
  }
}

let databaseManager: DatabaseManager | null = null;

export const getDatabaseManager = (config: Config): DatabaseManager => {
  if (!databaseManager) {
    databaseManager = new DatabaseManager(config);
  }
  return databaseManager;
};
