import { type Static, Type } from "@sinclair/typebox";

const SupportDatabaseType = Type.Enum({
  PostgreSQL: "postgresql",
  Sqlite3: "sqlite3",
});

// Define database connection pool configuration schema
const DatabasePoolConfig = Type.Object({
  // Maximum number of connections in the pool
  maxConnections: Type.Optional(Type.Number({ minimum: 1 })),
  // Minimum number of idle connections to maintain
  minConnections: Type.Optional(Type.Number({ minimum: 0 })),
  // Maximum time (in milliseconds) to wait for a connection
  acquireTimeout: Type.Optional(Type.Number({ minimum: 1 })),
  // Maximum time (in milliseconds) a connection can exist in the pool
  idleTimeout: Type.Optional(Type.Number({ minimum: 1 })),
  // Maximum time (in milliseconds) to wait for a connection to be established 
  connectTimeout: Type.Optional(Type.Number({ minimum: 1 })),
  // Maximum time (in milliseconds) to keep a connection alive
  keepAliveTimeout: Type.Optional(Type.Number({ minimum: 1 })),
}, {
  additionalProperties: false,
});

type DatabasePoolConfig = Static<typeof DatabasePoolConfig>;

// Define SSL configuration schema
const DatabaseSSLConfig = Type.Union([
  Type.Literal(true),
  Type.Literal(false),
  Type.Object({
    rejectUnauthorized: Type.Optional(Type.Boolean()),
    ca: Type.Optional(Type.String()),
    cert: Type.Optional(Type.String()),
    key: Type.Optional(Type.String()),
  })
], {
  additionalProperties: false,
});

type DatabaseSSLConfig = Static<typeof DatabaseSSLConfig>;

// Define the main database configuration schema
const Database = Type.Object({
  type: SupportDatabaseType,
  URI: Type.String(),
  // Optional pool configuration
  pool: Type.Optional(DatabasePoolConfig),
  // Optional SSL configuration
  ssl: Type.Optional(DatabaseSSLConfig),
  // Additional options for specific database types
  options: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  // Whether to enable query logging
  enableLogging: Type.Optional(Type.Boolean()),
  // Retry configuration
  retryAttempts: Type.Optional(Type.Number({ minimum: 0 })),
  retryDelay: Type.Optional(Type.Number({ minimum: 1 })),
}, {
  additionalProperties: false,
});

type Database = Static<typeof Database>;

export interface Config {
  readonly database: Database;
  readonly mode: "test" | "dev" | "production";
}

export const readConfig = (): Config => {
  const databaseType = (process.env as any).DATABASE_TYPE as "postgresql" | "sqlite3";
  const databaseURI = (process.env as any).DATABASE_URI || "";

  if (!databaseType || !databaseURI) {
    throw new Error("Invalid database configuration");
  }

  const mode = (process.env as any).NODE_ENV as "test" | "dev" | "production";

  if (!mode) {
    throw new Error("Invalid mode configuration");
  }

  // Determine default pool settings based on environment
  const defaultPoolSettings = {
    dev: { maxConnections: 10, minConnections: 2, acquireTimeout: 30000, idleTimeout: 60000 },
    test: { maxConnections: 5, minConnections: 0, acquireTimeout: 10000, idleTimeout: 30000 },
    production: { maxConnections: 20, minConnections: 5, acquireTimeout: 20000, idleTimeout: 120000 },
  }[mode];

  // Parse pool configuration from environment variables or use defaults
  const poolConfig = {
    maxConnections: (process.env as any).DATABASE_POOL_MAX_CONNECTIONS 
      ? parseInt((process.env as any).DATABASE_POOL_MAX_CONNECTIONS, 10) 
      : defaultPoolSettings?.maxConnections,
    minConnections: (process.env as any).DATABASE_POOL_MIN_CONNECTIONS 
      ? parseInt((process.env as any).DATABASE_POOL_MIN_CONNECTIONS, 10) 
      : defaultPoolSettings?.minConnections,
    acquireTimeout: (process.env as any).DATABASE_POOL_ACQUIRE_TIMEOUT 
      ? parseInt((process.env as any).DATABASE_POOL_ACQUIRE_TIMEOUT, 10) 
      : defaultPoolSettings?.acquireTimeout,
    idleTimeout: (process.env as any).DATABASE_POOL_IDLE_TIMEOUT 
      ? parseInt((process.env as any).DATABASE_POOL_IDLE_TIMEOUT, 10) 
      : defaultPoolSettings?.idleTimeout,
    connectTimeout: (process.env as any).DATABASE_POOL_CONNECT_TIMEOUT 
      ? parseInt((process.env as any).DATABASE_POOL_CONNECT_TIMEOUT, 10) 
      : 10000,
    keepAliveTimeout: (process.env as any).DATABASE_POOL_KEEP_ALIVE_TIMEOUT 
      ? parseInt((process.env as any).DATABASE_POOL_KEEP_ALIVE_TIMEOUT, 10) 
      : 300000,
  };

  // Filter out undefined values to create a clean pool config object
  const filteredPoolConfig = Object.fromEntries(
    Object.entries(poolConfig).filter(([_, value]) => value !== undefined)
  );

  // Parse SSL configuration
  const sslConfig = (process.env as any).DATABASE_SSL 
    ? JSON.parse((process.env as any).DATABASE_SSL) 
    : mode === "production";

  // Parse retry configuration
  const retryAttempts = (process.env as any).DATABASE_RETRY_ATTEMPTS 
    ? parseInt((process.env as any).DATABASE_RETRY_ATTEMPTS, 10) 
    : mode === "production" ? 3 : 1;
  
  const retryDelay = (process.env as any).DATABASE_RETRY_DELAY 
    ? parseInt((process.env as any).DATABASE_RETRY_DELAY, 10) 
    : 1000;

  return {
    database: {
      type: databaseType,
      URI: databaseURI,
      pool: filteredPoolConfig,
      ssl: sslConfig,
      enableLogging: (process.env as any).DATABASE_ENABLE_LOGGING === "true" || mode !== "production",
      retryAttempts: retryAttempts,
      retryDelay: retryDelay,
      options: (process.env as any).DATABASE_OPTIONS 
        ? JSON.parse((process.env as any).DATABASE_OPTIONS) 
        : {},
    },
    mode: mode,
  };
};
