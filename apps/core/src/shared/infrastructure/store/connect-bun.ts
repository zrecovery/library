import { Database } from "bun:sqlite";
import { Err, Ok, type Result } from "result";
import type { Config } from "src/shared/domain/config";
import { defaultLogger, LogLevel } from "src/shared/utils";

type ConnectionState = "disconnected" | "connected" | "error";

interface ConnectionStatus {
  readonly state: ConnectionState;
  readonly db: Database | null;
}

const createInitialStatus = (): ConnectionStatus => ({
  state: "disconnected",
  db: null,
});

let connectionStatus: ConnectionStatus = createInitialStatus();

const logInfo = (message: string): void => {
  defaultLogger.log(LogLevel.Info, message);
};

const logError = (message: string): void => {
  defaultLogger.log(LogLevel.Error, message);
};

const createConnection = (uri: string): Database => {
  logInfo(`Connecting to SQLite: ${uri}`);
  return new Database(uri);
};

const createConnectionStatus = (
  state: ConnectionState,
  db: Database | null,
): ConnectionStatus => Object.freeze({ state, db });

export const connectDb = (config: Config): Result<Database, Error> => {
  const { database: dbConfig } = config;

  if (!dbConfig.URI) {
    return Err(new Error("Database URI is required"));
  }

  if (connectionStatus.state === "connected" && connectionStatus.db) {
    return Ok(connectionStatus.db);
  }

  try {
    const db = createConnection(dbConfig.URI);
    connectionStatus = createConnectionStatus("connected", db);
    logInfo("Database connection established successfully");
    return Ok(db);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    connectionStatus = createConnectionStatus("error", null);
    logError(`Database connection failed: ${message}`);
    return Err(new Error(`Database connection failed: ${message}`));
  }
};

export const connectDbAsync = async (
  config: Config,
): Promise<Result<Database, Error>> => {
  return Ok(connectDb(config).unwrap());
};

export const getConnectionState = (): ConnectionState => connectionStatus.state;

export const disconnectDb = (): void => {
  if (connectionStatus.db) {
    connectionStatus.db.close();
    connectionStatus = createConnectionStatus("disconnected", null);
    logInfo("Database connection disconnected");
  }
};

export const getDb = (): Result<Database, Error> => {
  if (!connectionStatus.db) {
    return Err(new Error("Database not initialized. Call connectDb first."));
  }
  return Ok(connectionStatus.db);
};
