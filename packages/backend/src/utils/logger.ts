import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = pino({
  level: logLevel,
  timestamp: true,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l'
    }
  }
});

export const createContextLogger = (context: string) => {
  return logger.child({ context });
};

export type Logger = typeof logger;
