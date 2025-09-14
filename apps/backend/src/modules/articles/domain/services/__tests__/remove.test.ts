import { describe, test, expect, vi, beforeEach, afterEach } from "bun:test";
import { remove } from "../remove";
import { NotFoundError, UnknownError } from "@shared/domain/types/errors";
import type { Remover } from "@articles/domain/interfaces/store";
import { Ok, Err } from "result";
import { NotFoundStoreError, UnknownStoreError } from "@shared/domain/interfaces/store.error";

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
    expect(mockLogger.debug).toHaveBeenCalledWith("Removing article 1");
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
      expect(error.message).toBe("Not found article: 999");
    }
    expect(mockStore.remove).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith("Removing article 999");
  });

  test("should handle unknown store error", async () => {
    const articleId = 1;

    // Mock store remove to return unknown error
    const unknownError = new UnknownStoreError(
      "Database connection failed",
      new Error("Connection timeout")
    );
    
    mockStore.remove = vi.fn().mockResolvedValue(Err(unknownError));

    const removeFn = remove(mockLogger, mockStore);
    const result = await removeFn(articleId);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain("Unknown Store Error When removing article");
      expect(error.message).toContain("Database connection failed");
      // The raw error is embedded in the UnknownError
      expect(error.raw).toBeDefined();
    }
    expect(mockStore.remove).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith("Removing article 1");
  });
});