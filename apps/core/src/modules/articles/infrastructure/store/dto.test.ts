import { describe, expect, test } from "bun:test";
import type { ArticleDetail } from "@articles/domain/types/detail";
import type { ArticleMeta } from "@articles/domain/types/list";
import {
  createFindResult,
  createMetaResult,
  toModel,
  toModelList,
} from "./dto";

// ============================================================================
// Tests for toModel with FindResult
// ============================================================================

describe("toModel - FindResult to ArticleDetail", () => {
  test("should transform complete FindResult to ArticleDetail", () => {
    const findResult = createFindResult({
      article: {
        id: 1,
        title: "Test Article",
        body: "Test Body Content",
      },
      author: {
        id: 10,
        name: "John Doe",
      },
      chapter: {
        id: 5,
        title: "Chapter One",
        order: 1,
      },
    });

    const result = toModel(findResult);

    expect(result).toMatchObject({
      id: 1,
      title: "Test Article",
      body: "Test Body Content",
      author: {
        id: 10,
        name: "John Doe",
      },
      chapter: {
        id: 5,
        title: "Chapter One",
        order: 1,
      },
    });
  });

  test("should handle FindResult without chapter", () => {
    const findResult = createFindResult({
      article: {
        id: 2,
        title: "Article Without Chapter",
        body: "Body Content",
      },
      author: {
        id: 20,
        name: "Jane Smith",
      },
    });

    const result = toModel(findResult);

    expect(result.id).toBe(2);
    expect(result.title).toBe("Article Without Chapter");
    expect(result.author.id).toBe(20);
    expect(result.chapter).toBeUndefined();
  });

  test("should handle null author id with default value", () => {
    const findResult = createFindResult({
      article: {
        id: 3,
        title: "Test Article",
        body: "Body",
      },
      author: {
        id: null,
        name: null,
      },
    });

    const result = toModel(findResult);

    expect(result.author.id).toBe(0);
    expect(result.author.name).toBe("");
  });

  test("should handle partial author information", () => {
    const findResult = createFindResult({
      article: {
        id: 4,
        title: "Test",
        body: "Content",
      },
      author: {
        id: 15,
        name: null,
      },
    });

    const result = toModel(findResult);

    expect(result.author.id).toBe(15);
    expect(result.author.name).toBe("");
  });
});

// ============================================================================
// Tests for toModel with MetaResult
// ============================================================================

describe("toModel - MetaResult to ArticleMeta", () => {
  test("should transform complete MetaResult to ArticleMeta", () => {
    const metaResult = createMetaResult({
      article: {
        id: 100,
        title: "Meta Article",
      },
      author: {
        id: 50,
        name: "Author Name",
      },
      chapter: {
        id: 25,
        title: "Meta Chapter",
        order: 3,
      },
    });

    const result = toModel(metaResult);

    expect(result).toMatchObject({
      id: 100,
      title: "Meta Article",
      author: {
        id: 50,
        name: "Author Name",
      },
      chapter: {
        id: 25,
        title: "Meta Chapter",
        order: 3,
      },
    });
  });

  test("should handle MetaResult without chapter", () => {
    const metaResult = createMetaResult({
      article: {
        id: 101,
        title: "Simple Meta",
      },
      author: {
        id: 51,
        name: "Simple Author",
      },
    });

    const result = toModel(metaResult);

    expect(result.id).toBe(101);
    expect(result.title).toBe("Simple Meta");
    expect(result.chapter).toBeUndefined();
  });

  test("should handle null values in MetaResult", () => {
    const metaResult = createMetaResult({
      article: {
        id: 102,
        title: "Test Meta",
      },
      author: {
        id: null,
        name: null,
      },
    });

    const result = toModel(metaResult);

    expect(result.author.id).toBe(0);
    expect(result.author.name).toBe("");
  });
});

// ============================================================================
// Tests for toModelList
// ============================================================================

describe("toModelList", () => {
  test("should transform array of FindResults", () => {
    const findResults = [
      createFindResult({
        article: { id: 1, title: "Article 1", body: "Body 1" },
        author: { id: 10, name: "Author 1" },
      }),
      createFindResult({
        article: { id: 2, title: "Article 2", body: "Body 2" },
        author: { id: 20, name: "Author 2" },
        chapter: { id: 5, title: "Chapter 1", order: 1 },
      }),
    ];

    const results = toModelList(findResults);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(1);
    expect(results[0].title).toBe("Article 1");
    expect(results[1].chapter).toBeDefined();
    expect(results[1].chapter?.title).toBe("Chapter 1");
  });

  test("should transform array of MetaResults", () => {
    const metaResults = [
      createMetaResult({
        article: { id: 100, title: "Meta 1" },
        author: { id: 50, name: "Author 1" },
      }),
      createMetaResult({
        article: { id: 101, title: "Meta 2" },
        author: { id: 51, name: "Author 2" },
        chapter: { id: 25, title: "Chapter 2", order: 2 },
      }),
    ];

    const results = toModelList(metaResults);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(100);
    expect(results[1].chapter?.order).toBe(2);
  });

  test("should handle empty array", () => {
    const results = toModelList([]);
    expect(results).toHaveLength(0);
  });

  test("should handle mixed data quality", () => {
    const metaResults = [
      createMetaResult({
        article: { id: 1, title: "Good Data" },
        author: { id: 10, name: "Author" },
        chapter: { id: 5, title: "Chapter", order: 1 },
      }),
      createMetaResult({
        article: { id: 2, title: "Missing Chapter" },
        author: { id: null, name: null },
      }),
      createMetaResult({
        article: { id: 3, title: "Partial Data" },
        author: { id: 30, name: "Partial Author" },
      }),
    ];

    const results = toModelList(metaResults);

    expect(results).toHaveLength(3);
    expect(results[0].chapter).toBeDefined();
    expect(results[1].chapter).toBeUndefined();
    expect(results[1].author.id).toBe(0);
    expect(results[2].chapter).toBeUndefined();
  });
});

// ============================================================================
// Tests for createFindResult helper
// ============================================================================

describe("createFindResult", () => {
  test("should create FindResult with all fields", () => {
    const result = createFindResult({
      article: { id: 1, title: "Title", body: "Body" },
      author: { id: 10, name: "Author" },
      chapter: { id: 5, title: "Chapter", order: 1 },
    });

    expect(result.article.id).toBe(1);
    expect(result.article.title).toBe("Title");
    expect(result.article.body).toBe("Body");
    expect(result.author.id).toBe(10);
    expect(result.chapter.id).toBe(5);
  });

  test("should create FindResult without chapter", () => {
    const result = createFindResult({
      article: { id: 1, title: "Title", body: "Body" },
      author: { id: 10, name: "Author" },
    });

    expect(result.article.id).toBe(1);
    expect(result.chapter.id).toBeNull();
    expect(result.chapter.title).toBeNull();
    expect(result.chapter.order).toBeNull();
  });

  test("should handle null author values", () => {
    const result = createFindResult({
      article: { id: 1, title: "Title", body: "Body" },
      author: { id: null, name: null },
    });

    expect(result.author.id).toBeNull();
    expect(result.author.name).toBeNull();
  });
});

// ============================================================================
// Tests for createMetaResult helper
// ============================================================================

describe("createMetaResult", () => {
  test("should create MetaResult with all fields", () => {
    const result = createMetaResult({
      article: { id: 100, title: "Meta Title" },
      author: { id: 50, name: "Meta Author" },
      chapter: { id: 25, title: "Meta Chapter", order: 2 },
    });

    expect(result.article.id).toBe(100);
    expect(result.article.title).toBe("Meta Title");
    expect(result.author.id).toBe(50);
    expect(result.chapter.id).toBe(25);
  });

  test("should create MetaResult without chapter", () => {
    const result = createMetaResult({
      article: { id: 100, title: "Title" },
      author: { id: 50, name: "Author" },
    });

    expect(result.article.id).toBe(100);
    expect(result.chapter.id).toBeNull();
    expect(result.chapter.title).toBeNull();
    expect(result.chapter.order).toBeNull();
  });
});

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

describe("Edge Cases", () => {
  test("should handle chapter with all null fields", () => {
    const findResult = createFindResult({
      article: { id: 1, title: "Test", body: "Body" },
      author: { id: 10, name: "Author" },
    });

    // Manually set chapter fields to null
    const result = toModel({
      ...findResult,
      chapter: { id: null, title: null, order: null },
    });

    expect(result.chapter).toBeUndefined();
  });

  test("should handle chapter with partial null fields", () => {
    const result = toModel({
      article: { id: 1, title: "Test", body: "Body" },
      author: { id: 10, name: "Author" },
      chapter: { id: 5, title: null, order: null },
    });

    // Chapter should be undefined if not all fields are present
    expect(result.chapter).toBeUndefined();
  });

  test("should handle article with whitespace in fields", () => {
    const findResult = createFindResult({
      article: { id: 1, title: "  Trimmed Title  ", body: "  Body  " },
      author: { id: 10, name: "  Author  " },
    });

    const result = toModel(findResult);

    // Note: trimming should be handled at the save level, not transformation
    expect(result.title).toBe("  Trimmed Title  ");
    expect(result.body).toBe("  Body  ");
    expect(result.author.name).toBe("  Author  ");
  });

  test("should handle special characters in text fields", () => {
    const findResult = createFindResult({
      article: {
        id: 1,
        title: "Title with 'quotes' and \"double quotes\"",
        body: "Body with <html> & special chars™",
      },
      author: { id: 10, name: "Author & Co." },
      chapter: { id: 5, title: "Chapter #1: Introduction", order: 1 },
    });

    const result = toModel(findResult);

    expect(result.title).toContain("'quotes'");
    expect(result.body).toContain("<html>");
    expect(result.author.name).toBe("Author & Co.");
    expect(result.chapter?.title).toBe("Chapter #1: Introduction");
  });

  test("should handle very long text content", () => {
    const longBody = "x".repeat(10000);
    const longTitle = "t".repeat(500);

    const findResult = createFindResult({
      article: { id: 1, title: longTitle, body: longBody },
      author: { id: 10, name: "Author" },
    });

    const result = toModel(findResult);

    expect(result.title).toHaveLength(500);
    expect(result.body).toHaveLength(10000);
  });

  test("should handle numeric edge cases in IDs", () => {
    const findResult = createFindResult({
      article: { id: Number.MAX_SAFE_INTEGER, title: "Test", body: "Body" },
      author: { id: 0, name: "Zero ID Author" },
      chapter: { id: 1, title: "Chapter", order: 999 },
    });

    const result = toModel(findResult);

    expect(result.id).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.author.id).toBe(0);
    expect(result.chapter?.order).toBe(999);
  });

  test("should preserve order values including zero", () => {
    const findResult = createFindResult({
      article: { id: 1, title: "Test", body: "Body" },
      author: { id: 10, name: "Author" },
      chapter: { id: 5, title: "Prologue", order: 0 },
    });

    const result = toModel(findResult);

    expect(result.chapter?.order).toBe(0);
  });
});

// ============================================================================
// Type Safety Tests
// ============================================================================

describe("Type Safety", () => {
  test("FindResult should produce ArticleDetail type", () => {
    const findResult = createFindResult({
      article: { id: 1, title: "Test", body: "Body" },
      author: { id: 10, name: "Author" },
    });

    const result: ArticleDetail = toModel(findResult);

    // Type assertion should work without errors
    expect(result.body).toBeDefined();
  });

  test("MetaResult should produce ArticleMeta type", () => {
    const metaResult = createMetaResult({
      article: { id: 1, title: "Test" },
      author: { id: 10, name: "Author" },
    });

    const result: ArticleMeta = toModel(metaResult);

    // Type assertion should work without errors
    expect(result.id).toBeDefined();
    expect(result.title).toBeDefined();
  });
});

// ============================================================================
// Performance Tests (Basic)
// ============================================================================

describe("Performance", () => {
  test("should handle batch transformation efficiently", () => {
    const metaResults = Array.from({ length: 1000 }, (_, i) =>
      createMetaResult({
        article: { id: i, title: `Article ${i}` },
        author: { id: i * 10, name: `Author ${i}` },
      }),
    );

    const startTime = performance.now();
    const results = toModelList(metaResults);
    const endTime = performance.now();

    expect(results).toHaveLength(1000);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1000ms
  });

  test("should handle large individual records efficiently", () => {
    const largeBody = "x".repeat(100000); // 100KB of text

    const findResult = createFindResult({
      article: { id: 1, title: "Large Article", body: largeBody },
      author: { id: 10, name: "Author" },
    });

    const startTime = performance.now();
    const result = toModel(findResult);
    const endTime = performance.now();

    expect(result.body).toHaveLength(100000);
    expect(endTime - startTime).toBeLessThan(10); // Should be very fast
  });
});
