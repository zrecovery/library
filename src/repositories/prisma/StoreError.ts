export class StoreError extends Error {
  public type: ErrorType;
  public message: string;

  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
    this.message = message;
  }
}

export enum ErrorType {
  NotFound = "NotFound",
  ArgumentError = "ArgumentError",
  Other = "Other",
  InternalError = "InternalError",
}
