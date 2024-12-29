export interface Logger {
  info: (object: object, message: string) => void;
  warn: (object: object, message: string) => void;
  error: (object: object, message: string) => void;
  debug: (object: object, message: string) => void;
}
