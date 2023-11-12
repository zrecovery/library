type Config = {
  prismaClient?: {},
  LIMIT: number
}

const ProdConfig: Config = {
  LIMIT: 10
};

const DevConfig: Config = {
  prismaClient: {
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
  },
  LIMIT: 10
}

export const config = process.env.NODE_ENV === "production" ? ProdConfig : DevConfig;