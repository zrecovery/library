export enum DomainErrorTag {
  NotFound = "Not Found",
  Invalidation = "Invalidation",
  Unknown = "Unknown",
}

export class DomainError extends Error {
  constructor(
    message: string,
    readonly _tag: DomainErrorTag,
    readonly raw?: Error,
  ) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(
    message: string,
    readonly raw?: Error,
  ) {
    super(message, DomainErrorTag.NotFound, raw);
  }
}

export class UnknownError extends DomainError {
  constructor(
    message: string,
    readonly raw?: Error,
  ) {
    super(message, DomainErrorTag.Unknown, raw);
  }
}

export class InvalidationError extends DomainError {
  constructor(
    message: string,
    readonly raw?: Error,
  ) {
    super(message, DomainErrorTag.Invalidation, raw);
  }
}
