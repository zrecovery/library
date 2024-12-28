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
    public readonly type: StoreErrorType,
    public readonly raw?: unknown,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "StoreError";
    Object.setPrototypeOf(this, StoreError.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      context: this.context,
    };
  }
}
