type args = string | object | Error;

export interface Logger {
  info: (message: args) => void;
  warn: (message: args) => void;
  error: (message: args) => void;
  debug: (message: args) => void;
  trace: (message: Error) => void;
}
