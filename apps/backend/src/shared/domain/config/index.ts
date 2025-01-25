import { type Static, Type } from "@sinclair/typebox";

const SupportDatabaseType = Type.Enum({
  PostgreSQL: "postgresql",
  Sqlite3: "sqlite3",
});

const Database = Type.Object({
  type: SupportDatabaseType,
  URI: Type.String(),
});

type Database = Static<typeof Database>;

export interface Config {
  readonly database: Database;
  readonly mode: "test" | "dev" | "production";
}

export const readConfig = (): Config => {
  const databaseType = process.env.DATABASE_TYPE as "postgresql" | "sqlite3";
  const databaseURI = process.env.DATABASE_URI || "";

  if (!databaseType || !databaseURI) {
    throw new Error("Invalid database configuration");
  }

  const mode = process.env.NODE_ENV as "test" | "dev" | "production";

  if (!mode) {
    throw new Error("Invalid mode configuration");
  }

  return {
    database: {
      type: databaseType,
      URI: databaseURI,
    },
    mode: mode,
  };
};
