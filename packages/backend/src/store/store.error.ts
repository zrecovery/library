export enum StoreErrorType {
  NotFound = 0,
  Other = 1,
}

export class StoreError extends Error {
  type: StoreErrorType;
  raw?: unknown;

  constructor(message: string, type: StoreErrorType, raw?: unknown) {
    super(message);
    this.type = type;
    this.raw = raw;
  }
}
