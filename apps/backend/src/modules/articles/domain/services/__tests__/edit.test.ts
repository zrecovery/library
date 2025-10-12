import { describe, test, expect, vi, beforeEach, afterEach } from "bun:test";
import { edit } from "../edit";
import {
  NotFoundError,
  UnknownError,
  InvalidationError,
} from "@shared/domain/types/errors";
import type { Updater } from "@articles/domain/interfaces/store";
import { Ok, Err } from "result";
import type { ArticleUpdate } from "@articles/domain/types/update";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";

// Mock logger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  trace: vi.fn(),
};

// Mock store
const mockStore: Updater = {
  update: vi.fn(),
};

describe("Article Service - Edit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should update article successfully", async () => {
    const articleId = 1;
    const articleUpdate: ArticleUpdate = {
      id: 1,
      title: "Updated Article",
      body: "Updated Body",
      author: {
        id: 1,
        name: "Updated Author",
      },
      chapter: {
        id: 1,
        title: "Updated Chapter",
        order: 2,
      },
    };

    // Mock store update to return success
    mockStore.update = vi.fn().mockResolvedValue(Ok(null));

    const editFn = edit(mockLogger, mockStore);
    const result = await editFn(articleId, articleUpdate);

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBeNull();
    expect(mockStore.update).toHaveBeenCalledWith(articleId, articleUpdate);
    expect(mockLogger.debug).toHaveBeenCalledWith("Attempting to update article 1 with data: {\"id\":1,\"title\":\"Updated Article\",\"body\":\"Updated Body\",\"author\":{\"id\":1,\"name\":\"Updated Author\"},\"chapter\":{\"id\":1,\"title\":\"Updated Chapter\",\"order\":2}}");
  });

  test("should handle invalidation error", async () => {
    const articleId = 1;
    // Invalid update data - missing title
    const invalidUpdate: ArticleUpdate = {
      id: 1,
      body: "Updated Body",
    } as any;

    const editFn = edit(mockLogger, mockStore);
    const result = await editFn(articleId, invalidUpdate);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(InvalidationError);
      expect(error.message).toBe("Invalid input data for article update");
    }
    expect(mockStore.update).not.toHaveBeenCalled();
    expect(mockLogger.debug).toHaveBeenCalled();
  });

  test("should handle not found error", async () => {
    const articleId = 999;
    const articleUpdate: ArticleUpdate = {
      id: 999,
      title: "Non-existent Article",
      body: "Non-existent Body",
    };

    // Mock store update to return not found error
    const notFoundError = new NotFoundStoreError("Article not found");

    mockStore.update = vi.fn().mockResolvedValue(Err(notFoundError));

    const editFn = edit(mockLogger, mockStore);
    const result = await editFn(articleId, articleUpdate);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe("Article not found: 999");
    }
    expect(mockStore.update).toHaveBeenCalledWith(articleId, articleUpdate);
  });

  test("should handle unknown store error", async () => {
    const articleId = 1;
    const articleUpdate: ArticleUpdate = {
      id: 1,
      title: "Updated Article",
      body: "Updated Body",
    };

    // Mock store update to return unknown error
    const unknownError = new UnknownStoreError(
      "Database connection failed",
      new Error("Connection timeout"),
    );

    mockStore.update = vi.fn().mockResolvedValue(Err(unknownError));

    const editFn = edit(mockLogger, mockStore);
    const result = await editFn(articleId, articleUpdate);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain(
        "Failed to update article",
      );
      expect(error.message).toContain("Database connection failed");
      // The raw error is embedded in the UnknownError
      expect(error.raw).toBeDefined();
    }
    expect(mockStore.update).toHaveBeenCalledWith(articleId, articleUpdate);
  });

  test("should handle update without optional fields", async () => {
    const articleId = 1;
    const articleUpdate: ArticleUpdate = {
      id: 1,
      title: "Updated Article",
      body: "Updated Body",
      // No author or chapter
    };

    mockStore.update = vi.fn().mockResolvedValue(Ok(null));

    const editFn = edit(mockLogger, mockStore);
    const result = await editFn(articleId, articleUpdate);

    expect(result.isOk()).toBe(true);
    expect(mockStore.update).toHaveBeenCalledWith(articleId, articleUpdate);
  });
});
