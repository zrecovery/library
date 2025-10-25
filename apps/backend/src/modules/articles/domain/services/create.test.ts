import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError } from "@shared/domain";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error";
import { Err, Ok } from "result";
import { create } from "./create";

// ============================================================================
// Mock Setup
// ============================================================================

const createMockLogger = () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  trace: vi.fn(),
});

const createMockStore = (): Saver => ({
  save: vi.fn(),
});

// ============================================================================
// Test Data Factories
// ============================================================================

const createMinimalArticle = (): ArticleCreate => ({
  title: "Test Article",
  body: "Test Body",
  author: {
    name: "Test Author",
  },
});

const createCompleteArticle = (): ArticleCreate => ({
  title: "Complete Article",
  body: "Complete Body",
  author: {
    name: "Complete Author",
  },
  chapter: {
    title: "Test Chapter",
    order: 1,
  },
});

// ============================================================================
// Success Cases
// ============================================================================

describe("Article Service - Create - Success Cases", () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockStore: Saver;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockStore = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should create article with minimal required fields", async () => {
    const articleData = createMinimalArticle();
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
    expect(mockStore.save).toHaveBeenCalledWith(articleData);
    expect(mockStore.save).toHaveBeenCalledTimes(1);
  });

  test("should create article with all fields including chapter", async () => {
    const articleData = createCompleteArticle();
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
    expect(mockStore.save).toHaveBeenCalledWith(articleData);
    expect(articleData.chapter).toBeDefined();
  });

  test("should log debug message with article data", async () => {
    const articleData = createMinimalArticle();
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    await createFn(articleData);

    expect(mockLogger.debug).toHaveBeenCalledTimes(1);
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining("Creating article"),
    );
  });

  test("should handle article with special characters in title", async () => {
    const articleData: ArticleCreate = {
      title: "Article with 'quotes' and \"double quotes\"",
      body: "Body with <html> & special chars™",
      author: { name: "Author & Co." },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
    expect(mockStore.save).toHaveBeenCalledWith(articleData);
  });

  test("should handle article with unicode characters", async () => {
    const articleData: ArticleCreate = {
      title: "文章标题 with 中文",
      body: "Content with émojis 🚀 and 日本語",
      author: { name: "Author café" },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
  });

  test("should handle very long article content", async () => {
    const articleData: ArticleCreate = {
      title: "Long Article",
      body: "x".repeat(100000),
      author: { name: "Author" },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
  });
});

// ============================================================================
// Error Handling Cases
// ============================================================================

describe("Article Service - Create - Error Cases", () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockStore: Saver;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockStore = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should handle unknown store error", async () => {
    const articleData = createMinimalArticle();
    const storeError = new UnknownStoreError("Database connection failed");

    mockStore.save = vi.fn().mockResolvedValue(Err(storeError));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isErr()).toBe(true);

    if (result.isErr()) {
      const error = result.unwrapErr();
      expect(error).toBeInstanceOf(UnknownError);
      expect(error.message).toContain("Failed to create article");
      expect(error.message).toContain("Database connection failed");
      expect(error.raw).toBeDefined();
    }
  });

  test("should transform store error to domain error", async () => {
    const articleData = createMinimalArticle();
    const storeError = new UnknownStoreError("Constraint violation");

    mockStore.save = vi.fn().mockResolvedValue(Err(storeError));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.unwrapErr()).toBeInstanceOf(UnknownError);
      expect(result.unwrapErr().message).toContain("Failed to create article");
    }
  });

  test("should preserve original error information", async () => {
    const articleData = createMinimalArticle();
    const originalError = new Error("Original database error");
    const storeError = new UnknownStoreError("Store error", originalError);

    mockStore.save = vi.fn().mockResolvedValue(Err(storeError));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.unwrapErr().raw).toBeDefined();
    }
  });
});

// ============================================================================
// Integration and Functional Tests
// ============================================================================

describe("Article Service - Create - Integration", () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockStore: Saver;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockStore = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should be a curried function", async () => {
    const articleData = createMinimalArticle();
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);

    expect(typeof createFn).toBe("function");

    const result = await createFn(articleData);
    expect(result.isOk()).toBe(true);
  });

  test("should work with different logger and store instances", async () => {
    const articleData = createMinimalArticle();
    const logger1 = createMockLogger();
    const logger2 = createMockLogger();
    const store1 = createMockStore();
    const store2 = createMockStore();

    store1.save = vi.fn().mockResolvedValue(Ok(null));
    store2.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn1 = create(logger1, store1);
    const createFn2 = create(logger2, store2);

    await createFn1(articleData);
    await createFn2(articleData);

    expect(store1.save).toHaveBeenCalledTimes(1);
    expect(store2.save).toHaveBeenCalledTimes(1);
    expect(logger1.debug).toHaveBeenCalledTimes(1);
    expect(logger2.debug).toHaveBeenCalledTimes(1);
  });

  test("should pass exact data to store without modification", async () => {
    const articleData = createCompleteArticle();
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    await createFn(articleData);

    expect(mockStore.save).toHaveBeenCalledWith(articleData);

    const callArg = (mockStore.save as any).mock.calls[0][0];
    expect(callArg).toBe(articleData); // Same reference
  });

  test("should handle multiple sequential creates", async () => {
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));
    const createFn = create(mockLogger, mockStore);

    const article1 = { ...createMinimalArticle(), title: "Article 1" };
    const article2 = { ...createMinimalArticle(), title: "Article 2" };
    const article3 = { ...createMinimalArticle(), title: "Article 3" };

    const result1 = await createFn(article1);
    const result2 = await createFn(article2);
    const result3 = await createFn(article3);

    expect(result1.isOk()).toBe(true);
    expect(result2.isOk()).toBe(true);
    expect(result3.isOk()).toBe(true);
    expect(mockStore.save).toHaveBeenCalledTimes(3);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Article Service - Create - Edge Cases", () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockStore: Saver;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockStore = createMockStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should handle article with chapter order 0", async () => {
    const articleData: ArticleCreate = {
      title: "Prologue",
      body: "Beginning",
      author: { name: "Author" },
      chapter: { title: "Chapter 0", order: 0 },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
    expect(mockStore.save).toHaveBeenCalledWith(articleData);
  });

  test("should handle article with high chapter order", async () => {
    const articleData: ArticleCreate = {
      title: "Final Chapter",
      body: "End",
      author: { name: "Author" },
      chapter: { title: "Chapter 9999", order: 9999 },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
  });

  test("should handle empty strings in title and body", async () => {
    const articleData: ArticleCreate = {
      title: "",
      body: "",
      author: { name: "" },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
  });

  test("should handle whitespace-only content", async () => {
    const articleData: ArticleCreate = {
      title: "   ",
      body: "   ",
      author: { name: "   " },
    };
    mockStore.save = vi.fn().mockResolvedValue(Ok(null));

    const createFn = create(mockLogger, mockStore);
    const result = await createFn(articleData);

    expect(result.isOk()).toBe(true);
  });
});
