export enum StoreErrorType {
  NotFound = "NOT_FOUND",
  ValidationError = "VALIDATION_ERROR",
  DatabaseError = "DATABASE_ERROR",
  DuplicateEntry = "DUPLICATE_ENTRY",
  InvalidOperation = "INVALID_OPERATION",
  UnknownError = "UNKNOWN_ERROR",
}

export class StoreError extends Error {
  constructor(
    message: string,
    public readonly _tag: string,
    public readonly raw?: Error,
  ) {
    super(`${message}\n${raw ? raw.message : ""}`);
  }
}

export class NotFoundStoreError extends StoreError {
  constructor(message: string, raw?: Error) {
    super(message, "NotFound", raw);
  }
}

export class UnknownStoreError extends StoreError {
  constructor(message: string, raw?: Error) {
    super(message, "Unknown", raw);
  }
}
