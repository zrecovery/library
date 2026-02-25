import type { Logger } from "@shared/domain/interfaces/logger";

/**
 * LogLevel enum to specify the severity of log messages
 */
export enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Trace = "trace",
}

/**
 * A flexible logging interface that supports different logging implementations
 */
export interface FlexibleLogger extends Logger {
  log: (level: LogLevel, message: string | object | Error) => void;
  setLevel: (level: LogLevel) => void;
  getLevel: () => LogLevel;
  isEnabled: (level: LogLevel) => boolean;
}

/**
 * Console-based logger that implements the FlexibleLogger interface
 */
export class ConsoleLogger implements FlexibleLogger {
  private currentLevel: LogLevel = LogLevel.Info;

  log(level: LogLevel, message: string | object | Error): void {
    if (!this.isEnabled(level)) return;

    switch (level) {
      case LogLevel.Debug:
        console.debug(message);
        break;
      case LogLevel.Info:
        console.info(message);
        break;
      case LogLevel.Warn:
        console.warn(message);
        break;
      case LogLevel.Error:
        console.error(message);
        break;
      case LogLevel.Trace:
        console.trace(
          message instanceof Error ? message : new Error(String(message)),
        );
        break;
    }
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }

  isEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = [
      LogLevel.Debug,
      LogLevel.Info,
      LogLevel.Warn,
      LogLevel.Error,
      LogLevel.Trace,
    ];
    const currentLevelIndex = levels.indexOf(this.currentLevel);
    const requestedLevelIndex = levels.indexOf(level);

    // Debug and trace are special - they might need to be handled differently
    if (this.currentLevel === LogLevel.Debug) return true;
    if (level === LogLevel.Trace && this.currentLevel !== LogLevel.Error)
      return true;

    return requestedLevelIndex >= currentLevelIndex;
  }

  // Implement the existing Logger interface methods
  debug(message: string | object | Error): void {
    this.log(LogLevel.Debug, message);
  }

  info(message: string | object | Error): void {
    this.log(LogLevel.Info, message);
  }

  warn(message: string | object | Error): void {
    this.log(LogLevel.Warn, message);
  }

  error(message: string | object | Error): void {
    this.log(LogLevel.Error, message);
  }

  trace(message: Error): void {
    this.log(LogLevel.Trace, message);
  }
}

/**
 * Null logger that implements the FlexibleLogger interface but doesn't log anything
 */
export class NullLogger implements FlexibleLogger {
  log(_level: LogLevel, _message: string | object | Error): void {
    // Do nothing
  }

  setLevel(_level: LogLevel): void {
    // Do nothing
  }

  getLevel(): LogLevel {
    return LogLevel.Error; // Return highest level so most are disabled
  }

  isEnabled(_level: LogLevel): boolean {
    return false;
  }

  debug(_message: string | object | Error): void {
    // Do nothing
  }

  info(_message: string | object | Error): void {
    // Do nothing
  }

  warn(_message: string | object | Error): void {
    // Do nothing
  }

  error(_message: string | object | Error): void {
    // Do nothing
  }

  trace(_message: Error): void {
    // Do nothing
  }
}

/**
 * Creates a default console logger instance
 */
export const createConsoleLogger = (): FlexibleLogger => {
  return new ConsoleLogger();
};

/**
 * Creates a null logger instance for testing or disabled logging
 */
export const createNullLogger = (): FlexibleLogger => {
  return new NullLogger();
};
