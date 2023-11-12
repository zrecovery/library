interface PrismaClientConfig {
  log: Array<{
    emit: "event" | "stdout";
    level: "query" | "error" | "info" | "warn";
  }>;
}

interface Config {
  prismaClient?: PrismaClientConfig;
  readonly LIMIT: number;
}

const ProdConfig: Config = {
  LIMIT: 10,
};

const DevConfig: Config = {
  LIMIT: 10,
};

if (process.env.NODE_ENV === "development") {
  DevConfig.prismaClient = {
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
  };
}

export const config =
  process.env.NODE_ENV === "production" ? ProdConfig : DevConfig;
