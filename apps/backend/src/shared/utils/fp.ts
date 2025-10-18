import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import { StoreErrorTag } from "@shared/domain/interfaces/store.error";
import { NotFoundError, UnknownError } from "@shared/domain";
import type { Result } from "result";
import type { Id } from "@shared/domain/types/common";

/**
 * Creates a function that maps store errors to appropriate domain errors
 * 
 * @param logger - Logger for recording error details
 * @param entityNameLowercase - Lowercase name of the entity for error messages
 * @param entityNameCapitalized - Capitalized name of the entity for error messages (for NotFound errors)
 * @param operationName - Name of the operation (e.g., "create", "retrieve") for error messages
 * @returns Function that transforms store errors to domain errors
 */
export const createStoreResultErrorHandler = 
  (logger: Logger, entityNameLowercase: string, entityNameCapitalized: string, operationName: string = "retrieve") =>
  (id?: Id) =>
  (error: StoreError) => {
    switch (error._tag) {
      case StoreErrorTag.NotFound:
        return new NotFoundError(
          id ? `${entityNameCapitalized} not found: ${id}` : `${entityNameCapitalized} not found`
        );

      default:
        logger.trace(error);
        return new UnknownError(
          id 
            ? `Failed to ${operationName} ${entityNameLowercase} ${id}: ${error.message}` 
            : `Failed to ${operationName} ${entityNameLowercase}: ${error.message}`,
          error,
        );
    }
  };

/**
 * A higher-order function that wraps an async store operation with result/error handling
 * 
 * @param logger - Logger for recording operations
 * @param entityNameLowercase - Name of the entity being operated on (lowercase for unknown errors)
 * @param entityNameCapitalized - Capitalized name of the entity for not found errors
 * @param operationName - Name of the operation for error messages
 * @param storeOperation - The async store operation to wrap
 * @param id - Optional ID for error context
 * @returns Promise with transformed result/error handling
 */
export const withStoreResultHandling = <T, E>(
  logger: Logger,
  entityNameLowercase: string,
  entityNameCapitalized: string,
  operationName: string,
  storeOperation: () => Promise<Result<T, StoreError>>,
  id?: Id,
) => {
  const transformError = createStoreResultErrorHandler(logger, entityNameLowercase, entityNameCapitalized, operationName)(id);
  return async (): Promise<Result<T, NotFoundError | UnknownError>> => {
    const result = await storeOperation();
    return result.mapErr(transformError);
  };
};

/**
 * Pipes a value through a series of functions from left to right
 */
export const pipe = <T>(value: T, ...fns: Array<(arg: any) => any>) => {
  return fns.reduce((acc, fn) => fn(acc), value);
};

/**
 * Composes functions from right to left
 */
export function compose<A, B>(fn: (a: A) => B): (a: A) => B;
export function compose<A, B, C>(fn1: (b: B) => C, fn2: (a: A) => B): (a: A) => C;
export function compose<A, B, C, D>(fn1: (c: C) => D, fn2: (b: B) => C, fn3: (a: A) => B): (a: A) => D;
export function compose<A, B, C, D, E>(fn1: (d: D) => E, fn2: (c: C) => D, fn3: (b: B) => C, fn4: (a: A) => B): (a: A) => E;
export function compose<A, R>(...fns: Array<(arg: any) => any>) {
  return (arg: A): R => {
    return fns.reduceRight((acc, fn) => fn(acc), arg as any) as R;
  };
};

/**
 * Curries a function to allow partial application
 */
export const curry = <T, R>(fn: (args: T) => R): ((args: T) => R) => {
  return (args: T) => fn(args);
};

/**
 * Creates a memoized version of a function
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Creates a function that logs the execution of an operation
 */
export const createOperationLogger = 
  (logger: Logger, operationName: string) =>
  <T>(params?: T): void => {
    logger.debug(`${operationName}: ${params ? JSON.stringify(params) : 'Executing'}`);
  };