export class DomainError extends Error {
  constructor(
    message: string,
    readonly _tag: string,
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
    super(message, "NotFound", raw);
  }
}

export class UnknownError extends DomainError {
  constructor(
    message: string,
    readonly raw?: Error,
  ) {
    super(message, "Unknown", raw);
  }
}
