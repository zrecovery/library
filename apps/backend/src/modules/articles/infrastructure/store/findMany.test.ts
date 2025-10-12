import { describe, expect, test } from "bun:test";

// ============================================================================
// Mock Types and Data
// ============================================================================

type KeywordParts = {
  readonly positive: ReadonlyArray<string>;
  readonly negative: ReadonlyArray<string>;
};

// Helper functions extracted for testing (these mirror the implementation)
const extractPositiveKeywords = (parts: ReadonlyArray<string>): string[] =>
  parts
    .filter((part) => part.startsWith("+"))
    .map((part) => part.slice(1))
    .filter((keyword) => keyword.length > 0);

const extractNegativeKeywords = (parts: ReadonlyArray<string>): string[] =>
  parts
    .filter((part) => part.startsWith("-"))
    .map((part) => part.slice(1))
    .filter((keyword) => keyword.length > 0);

const parseKeywordParts = (keyword: string): KeywordParts => {
  const parts = keyword.trim().split(" ").filter(Boolean);

  return {
    positive: extractPositiveKeywords(parts),
    negative: extractNegativeKeywords(parts),
  };
};

const buildSearchQuery = (parts: KeywordParts): string => {
  const positiveQuery = parts.positive.join("  ");
  const negativeQuery = parts.negative
    .map((keyword) => `-${keyword}`)
    .join("  ");

  return [positiveQuery, negativeQuery]
    .filter(Boolean)
    .join("  ")
    .trim();
};

const hasValidKeywordParts = (parts: KeywordParts): boolean =>
  parts.positive.length > 0 || parts.negative.length > 0;

const calculateOffset = (page: number, size: number): number =>
  (page - 1) * size;

// ============================================================================
// Tests for extractPositiveKeywords
// ============================================================================

describe("extractPositiveKeywords", () => {
  test("should extract single positive keyword", () => {
    const parts = ["+love"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["love"]);
  });

  test("should extract multiple positive keywords", () => {
    const parts = ["+love", "+peace", "+joy"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["love", "peace", "joy"]);
  });

  test("should filter out negative keywords", () => {
    const parts = ["+love", "-hate", "+peace"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["love", "peace"]);
  });

  test("should filter out non-prefixed words", () => {
    const parts = ["+love", "neutral", "-hate"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["love"]);
  });

  test("should handle empty array", () => {
    const parts: string[] = [];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual([]);
  });

  test("should filter out empty keywords after prefix removal", () => {
    const parts = ["+", "+love", "+"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["love"]);
  });

  test("should handle keywords with special characters", () => {
    const parts = ["+user@example.com", "+hello-world", "+test_case"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["user@example.com", "hello-world", "test_case"]);
  });

  test("should preserve case sensitivity", () => {
    const parts = ["+Love", "+PEACE", "+JoY"];
    const result = extractPositiveKeywords(parts);
    expect(result).toEqual(["Love", "PEACE", "JoY"]);
  });
});

// ============================================================================
// Tests for extractNegativeKeywords
// ============================================================================

describe("extractNegativeKeywords", () => {
  test("should extract single negative keyword", () => {
    const parts = ["-hate"];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual(["hate"]);
  });

  test("should extract multiple negative keywords", () => {
    const parts = ["-hate", "-anger", "-fear"];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual(["hate", "anger", "fear"]);
  });

  test("should filter out positive keywords", () => {
    const parts = ["-hate", "+love", "-anger"];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual(["hate", "anger"]);
  });

  test("should filter out non-prefixed words", () => {
    const parts = ["-hate", "neutral", "+love"];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual(["hate"]);
  });

  test("should handle empty array", () => {
    const parts: string[] = [];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual([]);
  });

  test("should filter out empty keywords after prefix removal", () => {
    const parts = ["-", "-hate", "-"];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual(["hate"]);
  });

  test("should handle keywords with special characters", () => {
    const parts = ["-spam@example.com", "-bad-word", "-test_fail"];
    const result = extractNegativeKeywords(parts);
    expect(result).toEqual(["spam@example.com", "bad-word", "test_fail"]);
  });
});

// ============================================================================
// Tests for parseKeywordParts
// ============================================================================

describe("parseKeywordParts", () => {
  test("should parse only positive keywords", () => {
    const keyword = "+love +peace +joy";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["love", "peace", "joy"]);
    expect(result.negative).toEqual([]);
  });

  test("should parse only negative keywords", () => {
    const keyword = "-hate -anger -fear";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual([]);
    expect(result.negative).toEqual(["hate", "anger", "fear"]);
  });

  test("should parse mixed positive and negative keywords", () => {
    const keyword = "+love -hate +peace -anger";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["love", "peace"]);
    expect(result.negative).toEqual(["hate", "anger"]);
  });

  test("should handle keywords without prefix", () => {
    const keyword = "love hate peace";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual([]);
    expect(result.negative).toEqual([]);
  });

  test("should handle empty string", () => {
    const keyword = "";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual([]);
    expect(result.negative).toEqual([]);
  });

  test("should handle whitespace only", () => {
    const keyword = "   ";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual([]);
    expect(result.negative).toEqual([]);
  });

  test("should handle multiple spaces between keywords", () => {
    const keyword = "+love    -hate   +peace";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["love", "peace"]);
    expect(result.negative).toEqual(["hate"]);
  });

  test("should trim leading and trailing whitespace", () => {
    const keyword = "  +love -hate  ";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["love"]);
    expect(result.negative).toEqual(["hate"]);
  });

  test("should filter out empty prefixes", () => {
    const keyword = "+ +love - -hate";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["love"]);
    expect(result.negative).toEqual(["hate"]);
  });

  test("should handle single keyword", () => {
    const keyword = "+single";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["single"]);
    expect(result.negative).toEqual([]);
  });

  test("should handle complex real-world search", () => {
    const keyword = "+typescript +functional -legacy -deprecated +testing";
    const result = parseKeywordParts(keyword);
    expect(result.positive).toEqual(["typescript", "functional", "testing"]);
    expect(result.negative).toEqual(["legacy", "deprecated"]);
  });
});

// ============================================================================
// Tests for buildSearchQuery
// ============================================================================

describe("buildSearchQuery", () => {
  test("should build query with only positive keywords", () => {
    const parts: KeywordParts = {
      positive: ["love", "peace"],
      negative: [],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("love  peace");
  });

  test("should build query with only negative keywords", () => {
    const parts: KeywordParts = {
      positive: [],
      negative: ["hate", "anger"],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("-hate  -anger");
  });

  test("should build query with mixed keywords", () => {
    const parts: KeywordParts = {
      positive: ["love", "peace"],
      negative: ["hate", "anger"],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("love  peace  -hate  -anger");
  });

  test("should handle empty parts", () => {
    const parts: KeywordParts = {
      positive: [],
      negative: [],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("");
  });

  test("should handle single positive keyword", () => {
    const parts: KeywordParts = {
      positive: ["typescript"],
      negative: [],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("typescript");
  });

  test("should handle single negative keyword", () => {
    const parts: KeywordParts = {
      positive: [],
      negative: ["javascript"],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("-javascript");
  });

  test("should separate keywords with double spaces", () => {
    const parts: KeywordParts = {
      positive: ["one", "two", "three"],
      negative: [],
    };
    const result = buildSearchQuery(parts);
    expect(result).toContain("  ");
    expect(result.split("  ")).toHaveLength(3);
  });

  test("should preserve keyword order", () => {
    const parts: KeywordParts = {
      positive: ["first", "second", "third"],
      negative: ["fourth", "fifth"],
    };
    const result = buildSearchQuery(parts);
    expect(result).toBe("first  second  third  -fourth  -fifth");
  });
});

// ============================================================================
// Tests for hasValidKeywordParts
// ============================================================================

describe("hasValidKeywordParts", () => {
  test("should return true for positive keywords only", () => {
    const parts: KeywordParts = {
      positive: ["love"],
      negative: [],
    };
    expect(hasValidKeywordParts(parts)).toBe(true);
  });

  test("should return true for negative keywords only", () => {
    const parts: KeywordParts = {
      positive: [],
      negative: ["hate"],
    };
    expect(hasValidKeywordParts(parts)).toBe(true);
  });

  test("should return true for both positive and negative keywords", () => {
    const parts: KeywordParts = {
      positive: ["love"],
      negative: ["hate"],
    };
    expect(hasValidKeywordParts(parts)).toBe(true);
  });

  test("should return false for empty parts", () => {
    const parts: KeywordParts = {
      positive: [],
      negative: [],
    };
    expect(hasValidKeywordParts(parts)).toBe(false);
  });

  test("should return true for multiple positive keywords", () => {
    const parts: KeywordParts = {
      positive: ["one", "two", "three"],
      negative: [],
    };
    expect(hasValidKeywordParts(parts)).toBe(true);
  });

  test("should return true for multiple negative keywords", () => {
    const parts: KeywordParts = {
      positive: [],
      negative: ["one", "two", "three"],
    };
    expect(hasValidKeywordParts(parts)).toBe(true);
  });
});

// ============================================================================
// Tests for calculateOffset (Pagination)
// ============================================================================

describe("calculateOffset", () => {
  test("should calculate offset for first page", () => {
    const result = calculateOffset(1, 10);
    expect(result).toBe(0);
  });

  test("should calculate offset for second page", () => {
    const result = calculateOffset(2, 10);
    expect(result).toBe(10);
  });

  test("should calculate offset for tenth page", () => {
    const result = calculateOffset(10, 10);
    expect(result).toBe(90);
  });

  test("should calculate offset for different page sizes", () => {
    expect(calculateOffset(1, 20)).toBe(0);
    expect(calculateOffset(2, 20)).toBe(20);
    expect(calculateOffset(3, 20)).toBe(40);
  });

  test("should calculate offset for page size of 1", () => {
    expect(calculateOffset(1, 1)).toBe(0);
    expect(calculateOffset(5, 1)).toBe(4);
    expect(calculateOffset(100, 1)).toBe(99);
  });

  test("should calculate offset for large page sizes", () => {
    expect(calculateOffset(1, 100)).toBe(0);
    expect(calculateOffset(2, 100)).toBe(100);
    expect(calculateOffset(5, 100)).toBe(400);
  });

  test("should handle edge case with page 0 (invalid but mathematically correct)", () => {
    const result = calculateOffset(0, 10);
    expect(result).toBe(-10);
  });

  test("should calculate offset for various real-world scenarios", () => {
    // Standard pagination
    expect(calculateOffset(1, 25)).toBe(0);
    expect(calculateOffset(2, 25)).toBe(25);
    expect(calculateOffset(4, 25)).toBe(75);

    // Small page size
    expect(calculateOffset(1, 5)).toBe(0);
    expect(calculateOffset(10, 5)).toBe(45);

    // Large page size
    expect(calculateOffset(1, 50)).toBe(0);
    expect(calculateOffset(3, 50)).toBe(100);
  });
});

// ============================================================================
// Integration Tests - Full Keyword Processing Pipeline
// ============================================================================

describe("Keyword Processing Pipeline", () => {
  test("should process complete search query", () => {
    const keyword = "+typescript +functional -legacy";
    const parts = parseKeywordParts(keyword);
    const isValid = hasValidKeywordParts(parts);
    const query = buildSearchQuery(parts);

    expect(isValid).toBe(true);
    expect(query).toBe("typescript  functional  -legacy");
  });

  test("should reject invalid search query", () => {
    const keyword = "   ";
    const parts = parseKeywordParts(keyword);
    const isValid = hasValidKeywordParts(parts);

    expect(isValid).toBe(false);
  });

  test("should handle complex real-world query", () => {
    const keyword = "+react +hooks +typescript -class-components -legacy -deprecated";
    const parts = parseKeywordParts(keyword);

    expect(parts.positive).toEqual(["react", "hooks", "typescript"]);
    expect(parts.negative).toEqual(["class-components", "legacy", "deprecated"]);
    expect(hasValidKeywordParts(parts)).toBe(true);

    const query = buildSearchQuery(parts);
    expect(query).toContain("react");
    expect(query).toContain("hooks");
    expect(query).toContain("-deprecated");
  });

  test("should handle search with special characters", () => {
    const keyword = "+user@example.com -spam@test.com +hello-world";
    const parts = parseKeywordParts(keyword);

    expect(parts.positive).toContain("user@example.com");
    expect(parts.positive).toContain("hello-world");
    expect(parts.negative).toContain("spam@test.com");
  });

  test("should process query with pagination", () => {
    const keyword = "+test +example";
    const page = 3;
    const size = 20;

    const parts = parseKeywordParts(keyword);
    const offset = calculateOffset(page, size);
    const query = buildSearchQuery(parts);

    expect(hasValidKeywordParts(parts)).toBe(true);
    expect(offset).toBe(40);
    expect(query).toBe("test  example");
  });
});

// ============================================================================
// Edge Cases and Error Scenarios
// ============================================================================

describe("Edge Cases", () => {
  test("should handle keywords with numbers", () => {
    const keyword = "+v1.0 +2024 -v0.9";
    const parts = parseKeywordParts(keyword);
    expect(parts.positive).toEqual(["v1.0", "2024"]);
    expect(parts.negative).toEqual(["v0.9"]);
  });

  test("should handle keywords with unicode characters", () => {
    const keyword = "+café +naïve -résumé";
    const parts = parseKeywordParts(keyword);
    expect(parts.positive).toEqual(["café", "naïve"]);
    expect(parts.negative).toEqual(["résumé"]);
  });

  test("should handle very long keywords", () => {
    const longKeyword = "a".repeat(1000);
    const keyword = `+${longKeyword}`;
    const parts = parseKeywordParts(keyword);
    expect(parts.positive[0]).toHaveLength(1000);
  });

  test("should handle many keywords", () => {
    const keywords = Array.from({ length: 100 }, (_, i) => `+keyword${i}`).join(" ");
    const parts = parseKeywordParts(keywords);
    expect(parts.positive).toHaveLength(100);
  });

  test("should handle mixed valid and invalid syntax", () => {
    const keyword = "+valid invalid -valid2 +";
    const parts = parseKeywordParts(keyword);
    expect(parts.positive).toEqual(["valid"]);
    expect(parts.negative).toEqual(["valid2"]);
  });

  test("should handle duplicate keywords", () => {
    const keyword = "+test +test -test";
    const parts = parseKeywordParts(keyword);
    expect(parts.positive).toEqual(["test", "test"]);
    expect(parts.negative).toEqual(["test"]);
  });

  test("should handle keywords with dots and slashes", () => {
    const keyword = "+file.txt +path/to/file -old/path";
    const parts = parseKeywordParts(keyword);
    expect(parts.positive).toEqual(["file.txt", "path/to/file"]);
    expect(parts.negative).toEqual(["old/path"]);
  });
});

// ============================================================================
// Performance Tests
// ============================================================================

describe("Performance", () => {
  test("should handle large keyword string efficiently", () => {
    const keywords = Array.from({ length: 1000 }, (_, i) =>
      i % 2 === 0 ? `+pos${i}` : `-neg${i}`
    ).join(" ");

    const startTime = performance.now();
    const parts = parseKeywordParts(keywords);
    const endTime = performance.now();

    expect(parts.positive).toHaveLength(500);
    expect(parts.negative).toHaveLength(500);
    expect(endTime - startTime).toBeLessThan(50); // Should be fast
  });

  test("should build query from many keywords efficiently", () => {
    const parts: KeywordParts = {
      positive: Array.from({ length: 500 }, (_, i) => `keyword${i}`),
      negative: Array.from({ length: 500 }, (_, i) => `negative${i}`),
    };

    const startTime = performance.now();
    const query = buildSearchQuery(parts);
    const endTime = performance.now();

    expect(query.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(50);
  });
});
