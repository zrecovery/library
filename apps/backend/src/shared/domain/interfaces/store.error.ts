export enum StoreErrorTag {
  NotFound = "NOT FOUND",
  UnknownError = "UNKNOWN_ERROR",
  Invalidation = "INVALIDATION",
}

export class StoreError extends Error {
  constructor(
    message: string,
    public readonly _tag: StoreErrorTag,
    public readonly raw?: Error,
  ) {
    super(`${message}\n${raw ? raw.message : ""}`);
  }
}

export class NotFoundStoreError extends StoreError {
  constructor(message: string, raw?: Error) {
    super(message, StoreErrorTag.NotFound, raw);
  }
}

export class UnknownStoreError extends StoreError {
  constructor(message: string, raw?: Error) {
    super(message, StoreErrorTag.UnknownError, raw);
  }
}
