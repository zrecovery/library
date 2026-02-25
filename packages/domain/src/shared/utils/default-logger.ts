import { createConsoleLogger, type FlexibleLogger } from "./logger";

// Create a default logger instance for infrastructure use
const defaultLogger: FlexibleLogger = createConsoleLogger();

export { defaultLogger };
