import type { Logger } from "src/interface/logger";

type ErrorContext = Record<string, unknown>;

export const withErrorHandling = <T>(
    operation: string,
    logger: Logger,
    context: ErrorContext,
    fn: () => Promise<T>
): Promise<T> => {
    logger.debug(context, `Starting ${operation}`);
    return fn()
        .then(result => {
            logger.debug({ ...context, success: true }, `Completed ${operation}`);
            return result;
        })
        .catch(error => {
            logger.error({ ...context, error }, `Failed ${operation}`);
            throw error;
        });
};
