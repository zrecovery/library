import type { Id } from "../types/common";

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
    public readonly raw?: unknown,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    Object.setPrototypeOf(this, StoreError.prototype);
  }
}

export class NotFoundStoreError extends StoreError {
  constructor(message: string) {
    super(message, "NotFound");
  }
}

export class UnknownStoreError extends StoreError {
  constructor(message: string) {
    super(message, "Unknown");
  }
}
