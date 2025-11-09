import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import { Err, Ok } from "result";
import { detail } from "./detail";
import { UnknownError, NotFoundError } from "src/shared/domain";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "src/shared/domain/interfaces/store.error";
import type { Finder } from "../interfaces";
import type { ArticleDetail } from "../types";

// Mock logger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  trace: vi.fn(),
};

// Mock store
const mockStore: Finder = {
  find: vi.fn(),
};

describe("Article Service - Detail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should get article detail successfully", async () => {
    const articleId = 1;
    const articleDetail: ArticleDetail = {
      id: 1,
      title: "Test Article",
      body: "Test Body",
      author: {
        id: 1,
        name: "Test Author",
      },
      chapter: {
        id: 1,
        title: "Test Chapter",
        order: 1,
      },
    };

    // Mock store find to return success
    mockStore.find = vi.fn().mockResolvedValue(Ok(articleDetail));

    const detailFn = detail(mockLogger, mockStore);
    const result = await detailFn(articleId);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const value = result.unwrap();
      expect(value).toEqual(articleDetail);
    }
    expect(mockStore.find).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Searching for article with id: 1",
    );
  });

  test("should handle not found error", async () => {
    const articleId = 999;

    // Mock store find to return not found error
    const notFoundError = new NotFoundStoreError("Article not found");

    mockStore.find = vi.fn().mockResolvedValue(Err(notFoundError));

    const detailFn = detail(mockLogger, mockStore);
    const result = await detailFn(articleId);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Article not found: 999");
    }
    expect(mockStore.find).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Searching for article with id: 999",
    );
  });

  test("should handle unknown store error", async () => {
    const articleId = 1;

    // Mock store find to return unknown error
    const unknownError = new UnknownStoreError(
      "Database connection failed",
      new Error("Connection timeout"),
    );

    mockStore.find = vi.fn().mockResolvedValue(Err(unknownError));

    const detailFn = detail(mockLogger, mockStore);
    const result = await detailFn(articleId);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain("Failed to retrieve article");
      expect(error.message).toContain("Database connection failed");
      // The raw error is embedded in the UnknownError
      expect((error as UnknownError).raw).toBeDefined();
    }
    expect(mockStore.find).toHaveBeenCalledWith(articleId);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      "Searching for article with id: 1",
    );
    expect(mockLogger.trace).toHaveBeenCalledWith(unknownError);
  });
});
