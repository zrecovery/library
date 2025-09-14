import { describe, test, expect, vi, beforeEach, afterEach } from "bun:test";
import { findMany } from "../list";
import { UnknownError, InvalidationError } from "@shared/domain";
import type { Lister } from "@articles/domain/interfaces/store";
import { Ok, Err } from "result";
import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";
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
const mockStore: Lister = {
  findMany: vi.fn(),
};

describe("Article Service - List", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should list articles successfully", async () => {
    const query: ArticleQuery = {
      page: 1,
      size: 10,
      keyword: "test"
    };

    const listResponse: ArticleListResponse = {
      pagination: {
        page: 1,
        size: 10,
        total: 2,
        pages: 1
      },
      data: [
        {
          id: 1,
          title: "Test Article 1",
          author: {
            id: 1,
            name: "Test Author 1"
          },
          chapter: {
            id: 1,
            title: "Test Chapter 1",
            order: 1
          }
        },
        {
          id: 2,
          title: "Test Article 2",
          author: {
            id: 2,
            name: "Test Author 2"
          }
        }
      ]
    };

    // Mock store findMany to return success
    mockStore.findMany = vi.fn().mockResolvedValue(Ok(listResponse));

    const listFn = findMany(mockLogger, mockStore);
    const result = await listFn(query);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const value = result.unwrap();
      expect(value).toEqual(listResponse);
    }
    expect(mockStore.findMany).toHaveBeenCalledWith(query);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  test("should handle invalidation error", async () => {
    // Invalid query - negative page number
    const invalidQuery: ArticleQuery = {
      page: -1,
      size: 10
    } as any;

    const listFn = findMany(mockLogger, mockStore);
    const result = await listFn(invalidQuery);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(InvalidationError);
      expect(error.message).toContain("Invalid input");
    }
    expect(mockStore.findMany).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalled();
  });

  test("should handle unknown store error", async () => {
    const query: ArticleQuery = {
      page: 1,
      size: 10
    };

    // Mock store findMany to return unknown error
    const unknownError = new UnknownStoreError(
      "Database connection failed",
      new Error("Connection timeout")
    );
    
    mockStore.findMany = vi.fn().mockResolvedValue(Err(unknownError));

    const listFn = findMany(mockLogger, mockStore);
    const result = await listFn(query);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      // Get the error value from the Err result
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain("Unknown error");
      expect(error.message).toContain("Database connection failed");
      // The raw error is embedded in the UnknownError
      expect(error.raw).toBeDefined();
    }
    expect(mockStore.findMany).toHaveBeenCalledWith(query);
  });

  test("should handle query with only page and size", async () => {
    const query: ArticleQuery = {
      page: 2,
      size: 5
    };

    const listResponse: ArticleListResponse = {
      pagination: {
        page: 2,
        size: 5,
        total: 10,
        pages: 2
      },
      data: []
    };

    mockStore.findMany = vi.fn().mockResolvedValue(Ok(listResponse));

    const listFn = findMany(mockLogger, mockStore);
    const result = await listFn(query);

    expect(result.isOk()).toBe(true);
    expect(mockStore.findMany).toHaveBeenCalledWith(query);
  });

  test("should handle query with only keyword", async () => {
    const query: ArticleQuery = {
      keyword: "javascript"
    };

    const listResponse: ArticleListResponse = {
      pagination: {
        page: 1,
        size: 10,
        total: 1,
        pages: 1
      },
      data: [
        {
          id: 1,
          title: "JavaScript Guide",
          author: {
            id: 1,
            name: "JS Expert"
          }
        }
      ]
    };

    mockStore.findMany = vi.fn().mockResolvedValue(Ok(listResponse));

    const listFn = findMany(mockLogger, mockStore);
    const result = await listFn(query);

    expect(result.isOk()).toBe(true);
    expect(mockStore.findMany).toHaveBeenCalledWith(query);
  });
});