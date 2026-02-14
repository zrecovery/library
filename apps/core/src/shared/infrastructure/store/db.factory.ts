import type { Result } from "result";
import type { Config } from "src/shared/domain/config";

type DatabaseClient = unknown;

interface DatabaseConnection {
  readonly connect: (config: Config) => Result<DatabaseClient, Error>;
  readonly connectAsync: (
    config: Config,
  ) => Promise<Result<DatabaseClient, Error>>;
  readonly disconnect: () => void;
  readonly getClient: () => Result<DatabaseClient, Error>;
  readonly getConnectionState: () => string;
}

type DatabaseType = "postgresql" | "sqlite3";

const createPostgresConnection = (): DatabaseConnection => {
  const { connectDb, connectDbAsync, disconnectDb, getDb, getConnectionState } =
    require("./connect") as {
      connectDb: (config: Config) => Result<unknown, Error>;
      connectDbAsync: (config: Config) => Promise<Result<unknown, Error>>;
      disconnectDb: () => void;
      getDb: () => Result<unknown, Error>;
      getConnectionState: () => string;
    };

  return {
    connect: connectDb,
    connectAsync: connectDbAsync,
    disconnect: disconnectDb,
    getClient: getDb,
    getConnectionState,
  };
};

const createSqliteConnection = (): DatabaseConnection => {
  const { connectDb, connectDbAsync, disconnectDb, getDb, getConnectionState } =
    require("./connect-bun") as {
      connectDb: (config: Config) => Result<unknown, Error>;
      connectDbAsync: (config: Config) => Promise<Result<unknown, Error>>;
      disconnectDb: () => void;
      getDb: () => Result<unknown, Error>;
      getConnectionState: () => string;
    };

  return {
    connect: connectDb,
    connectAsync: connectDbAsync,
    disconnect: disconnectDb,
    getClient: getDb,
    getConnectionState,
  };
};

const selectDatabaseType = (config: Config): DatabaseType => {
  const dbType = config.database.type;
  if (dbType !== "postgresql" && dbType !== "sqlite3") {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
  return dbType;
};

const createConnection = (dbType: DatabaseType): DatabaseConnection => {
  switch (dbType) {
    case "postgresql":
      return createPostgresConnection();
    case "sqlite3":
      return createSqliteConnection();
  }
};

export const createDatabaseConnection = (
  config: Config,
): DatabaseConnection => {
  const dbType = selectDatabaseType(config);
  return createConnection(dbType);
};

export type { DatabaseConnection, DatabaseType };
