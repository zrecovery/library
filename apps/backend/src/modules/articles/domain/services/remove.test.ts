import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import type { Remover } from "@articles/domain/interfaces/store";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import { NotFoundError, UnknownError } from "@shared/domain/types/errors";
import { Err, Ok } from "result";
import { remove } from "./remove";

// Mock logger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  trace: vi.fn(),
};

// Mock store
const mockStore: Remover = {
  remove: vi.fn(),
};

describe("Article Service - Remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should remove article successfully", async () => {
    const articleId = 1;

    // Mock store remove to return success
    mockStore.remove = vi.fn().mockResolvedValue(Ok(null));

    const removeFn = remove(mockLogger, mockStore);
    const result = await removeFn(articleId);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeNull();
    expect(mockStore.remove).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Attempting to remove article with id: 1",
    );
  });

  test("should handle not found error", async () => {
    const articleId = 999;

    // Mock store remove to return not found error
    const notFoundError = new NotFoundStoreError("Article not found");

    mockStore.remove = vi.fn().mockResolvedValue(Err(notFoundError));

    const removeFn = remove(mockLogger, mockStore);
    const result = await removeFn(articleId);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Article not found: 999");
    }
    expect(mockStore.remove).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Attempting to remove article with id: 999",
    );
  });

  test("should handle unknown store error", async () => {
    const articleId = 1;

    // Mock store remove to return unknown error
    const unknownError = new UnknownStoreError(
      "Database connection failed",
      new Error("Connection timeout"),
    );

    mockStore.remove = vi.fn().mockResolvedValue(Err(unknownError));

    const removeFn = remove(mockLogger, mockStore);
    const result = await removeFn(articleId);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain("Failed to remove article");
      expect(error.message).toContain("Database connection failed");
      // The raw error is embedded in the UnknownError
      expect(error.raw).toBeDefined();
    }
    expect(mockStore.remove).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Attempting to remove article with id: 1",
    );
  });
});
