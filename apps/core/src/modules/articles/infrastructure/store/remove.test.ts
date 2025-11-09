import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { eq } from "drizzle-orm";
import { DrizzleRemover, createDrizzleRemover } from "./remove";
import { DrizzleSaver } from "./save";
import type {
  articles,
  authors,
  chapters,
  people,
  series,
} from "src/shared/infrastructure/store/schema";
import { withTestDb } from "src/utils/test";
import type { ArticleCreate } from "../../domain";

beforeEach(() => {});
afterEach(() => {});

// ============================================================================
// Helper Functions
// ============================================================================

const createTestArticle = async (db: any, data: ArticleCreate) => {
  const saver = new DrizzleSaver(db);
  const result = await saver.save(data);

  if (result.isErr()) {
    throw new Error("Failed to create test article");
  }

  // Get the created article ID
  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.title, data.title));

  return article.id;
};

const articleExists = async (db: any, id: number): Promise<boolean> => {
  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, id));

  return !!article;
};

const authorRelationsExist = async (
  db: any,
  articleId: number,
): Promise<boolean> => {
  const [author] = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.article_id, articleId));

  return !!author;
};

const chapterRelationsExist = async (
  db: any,
  articleId: number,
): Promise<boolean> => {
  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.article_id, articleId));

  return !!chapter;
};

// ============================================================================
// Tests for createDrizzleRemover Factory Function
// ============================================================================

describe("createDrizzleRemover", () => {
  test(
    "should create a functional remover",
    withTestDb(async (db) => {
      const remover = createDrizzleRemover(db);

      expect(remover).toBeDefined();
      expect(remover.remove).toBeDefined();
      expect(typeof remover.remove).toBe("function");
    }),
  );

  test(
    "should create independent remover instances",
    withTestDb(async (db) => {
      const remover1 = createDrizzleRemover(db);
      const remover2 = createDrizzleRemover(db);

      expect(remover1).not.toBe(remover2);
      expect(remover1.remove).toBeDefined();
      expect(remover2.remove).toBeDefined();
    }),
  );
});

// ============================================================================
// Tests for DrizzleRemover Class (Legacy)
// ============================================================================

describe("DrizzleRemover - Legacy Class", () => {
  test(
    "should create instance with database",
    withTestDb(async (db) => {
      const remover = new DrizzleRemover(db);

      expect(remover).toBeDefined();
      expect(remover.remove).toBeDefined();
    }),
  );
});

// ============================================================================
// Success Cases - Basic Article Removal
// ============================================================================

describe("Article Removal - Success Cases", () => {
  test(
    "should remove article with only required fields",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article to Remove",
        body: "Content to remove",
        author: { name: "Test Author" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // Verify article exists before removal
      expect(await articleExists(db, articleId)).toBe(true);

      // Remove article
      const result = await remover.remove(articleId);

      // Verify successful removal
      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );

  test(
    "should remove article with all fields including chapter",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Complete Article",
        body: "Complete content",
        author: { name: "Complete Author" },
        chapter: {
          title: "Test Chapter",
          order: 1,
        },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // Verify article and relations exist
      expect(await articleExists(db, articleId)).toBe(true);
      expect(await authorRelationsExist(db, articleId)).toBe(true);
      expect(await chapterRelationsExist(db, articleId)).toBe(true);

      // Remove article
      const result = await remover.remove(articleId);

      // Verify complete removal
      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
      expect(await authorRelationsExist(db, articleId)).toBe(false);
      expect(await chapterRelationsExist(db, articleId)).toBe(false);
    }),
  );

  test(
    "should remove multiple articles sequentially",
    withTestDb(async (db) => {
      const remover = createDrizzleRemover(db);

      // Create multiple articles
      const id1 = await createTestArticle(db, {
        title: "Article 1",
        body: "Body 1",
        author: { name: "Author 1" },
      });

      const id2 = await createTestArticle(db, {
        title: "Article 2",
        body: "Body 2",
        author: { name: "Author 2" },
      });

      const id3 = await createTestArticle(db, {
        title: "Article 3",
        body: "Body 3",
        author: { name: "Author 3" },
      });

      // Remove all articles
      const result1 = await remover.remove(id1);
      const result2 = await remover.remove(id2);
      const result3 = await remover.remove(id3);

      // Verify all removals succeeded
      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
      expect(result3.isOk()).toBe(true);

      expect(await articleExists(db, id1)).toBe(false);
      expect(await articleExists(db, id2)).toBe(false);
      expect(await articleExists(db, id3)).toBe(false);
    }),
  );
});

// ============================================================================
// Relationship Cleanup Tests
// ============================================================================

describe("Relationship Cleanup", () => {
  test(
    "should remove author relationships when removing article",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article with Author",
        body: "Content",
        author: { name: "Author to Clean" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // Verify author relationship exists
      expect(await authorRelationsExist(db, articleId)).toBe(true);

      // Remove article
      await remover.remove(articleId);

      // Verify author relationship is removed
      expect(await authorRelationsExist(db, articleId)).toBe(false);

      // Verify person still exists (should not be deleted)
      const [person] = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.name, "Author to Clean"));

      expect(person).toBeDefined();
    }),
  );

  test(
    "should remove chapter relationships when removing article",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article with Chapter",
        body: "Content",
        author: { name: "Author" },
        chapter: {
          title: "Chapter to Clean",
          order: 1,
        },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // Verify chapter relationship exists
      expect(await chapterRelationsExist(db, articleId)).toBe(true);

      // Remove article
      await remover.remove(articleId);

      // Verify chapter relationship is removed
      expect(await chapterRelationsExist(db, articleId)).toBe(false);

      // Verify series still exists (should not be deleted)
      const [seriesRecord] = await db
        .select({ id: series.id })
        .from(series)
        .where(eq(series.title, "Chapter to Clean"));

      expect(seriesRecord).toBeDefined();
    }),
  );

  test(
    "should remove all relationships when removing article with complete data",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Complete Article",
        body: "Complete content",
        author: { name: "Complete Author" },
        chapter: {
          title: "Complete Chapter",
          order: 5,
        },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // Verify all relationships exist
      expect(await authorRelationsExist(db, articleId)).toBe(true);
      expect(await chapterRelationsExist(db, articleId)).toBe(true);

      // Remove article
      await remover.remove(articleId);

      // Verify all relationships are removed
      expect(await authorRelationsExist(db, articleId)).toBe(false);
      expect(await chapterRelationsExist(db, articleId)).toBe(false);
    }),
  );
});

// ============================================================================
// Error Cases
// ============================================================================

describe("Article Removal - Error Cases", () => {
  test(
    "should return NotFoundError for non-existent article",
    withTestDb(async (db) => {
      const remover = createDrizzleRemover(db);
      const nonExistentId = 999999;

      const result = await remover.remove(nonExistentId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.unwrapErr().message).toContain("not found");
      }
    }),
  );

  test(
    "should return error for negative article ID",
    withTestDb(async (db) => {
      const remover = createDrizzleRemover(db);
      const invalidId = -1;

      const result = await remover.remove(invalidId);

      expect(result.isErr()).toBe(true);
    }),
  );

  test(
    "should return error for zero article ID",
    withTestDb(async (db) => {
      const remover = createDrizzleRemover(db);
      const invalidId = 0;

      const result = await remover.remove(invalidId);

      expect(result.isErr()).toBe(true);
    }),
  );

  test(
    "should handle double deletion attempt",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article for Double Delete",
        body: "Content",
        author: { name: "Author" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // First deletion should succeed
      const firstResult = await remover.remove(articleId);
      expect(firstResult.isOk()).toBe(true);

      // Second deletion should fail with NotFound
      const secondResult = await remover.remove(articleId);
      expect(secondResult.isErr()).toBe(true);
      if (secondResult.isErr()) {
        expect(secondResult.unwrapErr().message).toContain("not found");
      }
    }),
  );
});

// ============================================================================
// Transaction and Atomicity Tests
// ============================================================================

describe("Transaction Atomicity", () => {
  test(
    "should remove article and relationships atomically",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Atomic Test Article",
        body: "Atomic content",
        author: { name: "Atomic Author" },
        chapter: {
          title: "Atomic Chapter",
          order: 1,
        },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      // Remove article
      const result = await remover.remove(articleId);
      expect(result.isOk()).toBe(true);

      // Verify everything is removed or nothing is removed (atomicity)
      const articleStillExists = await articleExists(db, articleId);
      const authorStillExists = await authorRelationsExist(db, articleId);
      const chapterStillExists = await chapterRelationsExist(db, articleId);

      // All should be removed together
      expect(articleStillExists).toBe(false);
      expect(authorStillExists).toBe(false);
      expect(chapterStillExists).toBe(false);
    }),
  );

  test(
    "should maintain referential integrity during deletion",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Integrity Test",
        body: "Content",
        author: { name: "Shared Author" },
        chapter: {
          title: "Shared Chapter",
          order: 1,
        },
      };

      // Create two articles with same author and chapter
      const id1 = await createTestArticle(db, testData);
      const id2 = await createTestArticle(db, {
        ...testData,
        title: "Integrity Test 2",
        chapter: { ...testData.chapter!, order: 2 },
      });

      const remover = createDrizzleRemover(db);

      // Remove first article
      await remover.remove(id1);

      // Verify second article still has its relationships
      expect(await articleExists(db, id2)).toBe(true);
      expect(await authorRelationsExist(db, id2)).toBe(true);
      expect(await chapterRelationsExist(db, id2)).toBe(true);

      // Verify shared person and series still exist
      const [person] = await db
        .select({ id: people.id })
        .from(people)
        .where(eq(people.name, "Shared Author"));
      expect(person).toBeDefined();

      const [seriesRecord] = await db
        .select({ id: series.id })
        .from(series)
        .where(eq(series.title, "Shared Chapter"));
      expect(seriesRecord).toBeDefined();
    }),
  );
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  test(
    "should handle removal of article with special characters in title",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article with 'quotes' and \"double quotes\" & symbols™",
        body: "Content",
        author: { name: "Author" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );

  test(
    "should handle removal of article with unicode characters",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article with 中文 and émojis 🚀",
        body: "Content with 日本語",
        author: { name: "Author with café" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );

  test(
    "should handle removal of article with very long content",
    withTestDb(async (db) => {
      const longBody = "x".repeat(100000);
      const testData: ArticleCreate = {
        title: "Article with long body",
        body: longBody,
        author: { name: "Author" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );

  test(
    "should handle article with chapter order 0",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article with zero order",
        body: "Content",
        author: { name: "Author" },
        chapter: {
          title: "Prologue",
          order: 0,
        },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
      expect(await chapterRelationsExist(db, articleId)).toBe(false);
    }),
  );

  test(
    "should handle article with high chapter order",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Article with high order",
        body: "Content",
        author: { name: "Author" },
        chapter: {
          title: "Final Chapter",
          order: 9999,
        },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );
});

// ============================================================================
// Concurrent Operations Tests
// ============================================================================

describe("Concurrent Operations", () => {
  test(
    "should handle sequential removals of different articles",
    withTestDb(async (db) => {
      const remover = createDrizzleRemover(db);
      const ids: number[] = [];

      // Create 5 articles
      for (let i = 0; i < 5; i++) {
        const id = await createTestArticle(db, {
          title: `Concurrent Article ${i}`,
          body: `Content ${i}`,
          author: { name: `Author ${i}` },
        });
        ids.push(id);
      }

      // Remove all articles sequentially
      const results = [];
      for (const id of ids) {
        const result = await remover.remove(id);
        results.push(result);
      }

      // Verify all removals succeeded
      for (const result of results) {
        expect(result.isOk()).toBe(true);
      }

      // Verify all articles are removed
      for (const id of ids) {
        expect(await articleExists(db, id)).toBe(false);
      }
    }),
  );
});

// ============================================================================
// Integration with Other Operations
// ============================================================================

describe("Integration Tests", () => {
  test(
    "should work with legacy class instance",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Legacy Test Article",
        body: "Content",
        author: { name: "Legacy Author" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = new DrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );

  test(
    "should work with factory function instance",
    withTestDb(async (db) => {
      const testData: ArticleCreate = {
        title: "Factory Test Article",
        body: "Content",
        author: { name: "Factory Author" },
      };

      const articleId = await createTestArticle(db, testData);
      const remover = createDrizzleRemover(db);

      const result = await remover.remove(articleId);

      expect(result.isOk()).toBe(true);
      expect(await articleExists(db, articleId)).toBe(false);
    }),
  );
});
