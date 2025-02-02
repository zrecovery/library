export enum WebRepositoryErrorTag {
  NotFound = "NotFound",
  Invalidate = "Invalidate",
}

export class WebRepositoryError extends Error {
  tag: WebRepositoryErrorTag;
  raw?: Error;

  constructor(message: string, tag: WebRepositoryErrorTag, raw?: Error) {
    super(message);
    this.tag = tag;
    this.raw = raw;
  }
}

export class NotFoundWebRepositoryError extends WebRepositoryError {
  constructor(message: string, raw?: Error) {
    super(message, WebRepositoryErrorTag.NotFound, raw);
  }
}

export class UnknownWebRepositoryError extends WebRepositoryError {
  constructor(message: string, raw?: Error) {
    super(message, WebRepositoryErrorTag.NotFound, raw);
  }
}

export class InvalidateWebRepositoryError extends WebRepositoryError {
  constructor(message: string, raw?: Error) {
    super(message, WebRepositoryErrorTag.Invalidate, raw);
  }
}
