import { describe, test, expect, vi, beforeEach, afterEach } from "bun:test";
import { create } from "../create";
import { UnknownError } from "@shared/domain";
import type { ArticleCreate } from "@articles/domain/types/create";
import type { Saver } from "@articles/domain/interfaces/store";
import { Ok, Err } from "result";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error";

// Mock logger
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  trace: vi.fn(),
};

// Mock store
const mockStore: Saver = {
  save: vi.fn(),
};

describe("Article Service - Create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should create article successfully", async () => {
    const articleCreate: ArticleCreate = {
      title: "Test Article",
      body: "Test Body",
      author: {
        name: "Test Author",
      },
      chapter: {
        title: "Test Chapter",
        order: 1,
      },
    };

    // Mock store save to return success
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleCreate);

    expect(result.isOk()).toBe(true);
    expect(mockStore.save).toHaveBeenCalledWith(articleCreate);
    expect(mockLogger.debug).not.toHaveBeenCalled();
  });

  test("should handle unknown store error", async () => {
    const articleCreate: ArticleCreate = {
      title: "Test Article",
      body: "Test Body",
      author: {
        name: "Test Author",
      },
    };

    // Mock store save to return error
    const storeError = new UnknownStoreError(
      "Database connection failed",
      new Error("Connection timeout"),
    );

    mockStore.save = vi.fn().mockResolvedValue(Err(storeError));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleCreate);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain(
        "Unknown Store Error When create article",
      );
      expect(error.message).toContain("Database connection failed");
      // The raw error is embedded in the UnknownError
      expect(error.raw).toBeDefined();
    }
    expect(mockStore.save).toHaveBeenCalledWith(articleCreate);
  });

  test("should pass data correctly to store", async () => {
    const articleCreate: ArticleCreate = {
      title: "Another Test Article",
      body: "Another Test Body",
      author: {
        name: "Another Test Author",
      },
    };

    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    await createFn(articleCreate);

    expect(mockStore.save).toHaveBeenCalledWith({
      title: "Another Test Article",
      body: "Another Test Body",
      author: {
        name: "Another Test Author",
      },
    });
  });
});
