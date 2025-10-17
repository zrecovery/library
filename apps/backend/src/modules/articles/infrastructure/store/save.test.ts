import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { ArticleCreate } from "@articles/domain/types/create";
import { articles, series } from "@shared/infrastructure/store/schema";
import { withTestDb } from "@utils/test";
import { eq } from "drizzle-orm";
import { DrizzleSaver } from "./save";

beforeEach(() => {});
afterEach(() => {});

describe("Success Cases", () => {
  test(
    "should create article with required fields",
    withTestDb(async (db) => {
      const input: ArticleCreate = {
        title: "Test Title",
        body: "Test body",
        author: { name: "Test Author" },
      };

      const saver = new DrizzleSaver(db);
      await saver.save(input);

      // Verify article creation
      const result = await db.query.articles.findFirst({
        with: {
          authors: {
            with: {
              person: true,
            },
          },
        },
        where: eq(articles.title, input.title),
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe(input.title);
      expect(result?.body).toBe(input.body);
      expect(result?.authors?.person.name).toBe(input.author.name);
    }),
  );

  test(
    "should create article with chapter",
    withTestDb(async (db) => {
      const input: ArticleCreate = {
        title: "Test Title",
        body: "Test body",
        author: { name: "Test Author" },
        chapter: {
          title: "Test Chapter",
          order: 1,
        },
      };

      const saver = new DrizzleSaver(db);
      await saver.save(input);

      // Verify article and chapter creation
      const result = await db.query.articles.findFirst({
        with: {
          authors: {
            with: {
              person: true,
            },
          },
          chapters: {
            with: {
              series: true,
            },
          },
        },
        where: eq(articles.title, input.title),
      });

      expect(result).toBeDefined();
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      expect(result?.chapters?.series.title).toBe(input.chapter!.title);
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      expect(result?.chapters?.order).toBe(input.chapter!.order);
    }),
  );
});

describe("Error Cases", () => {
  test(
    "should handle duplicate chapter title",
    withTestDb(async (db) => {
      const input1: ArticleCreate = {
        title: "Test Title 1",
        body: "Test body 1",
        author: { name: "Test Author" },
        chapter: {
          title: "Same Chapter",
          order: 1,
        },
      };

      const input2: ArticleCreate = {
        title: "Test Title 2",
        body: "Test body 2",
        author: { name: "Test Author" },
        chapter: {
          title: "Same Chapter",
          order: 2,
        },
      };
      const saver = new DrizzleSaver(db);
      await saver.save(input1);
      await saver.save(input2);

      // Verify both articles share the same series
      const results = await db.query.articles.findMany({
        with: {
          chapters: {
            with: {
              series: true,
            },
          },
        },
        where: eq(series.title, "Same Chapter"),
      });

      expect(results).toHaveLength(2);

      expect(results[0].chapters?.series.id).toBe(
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        results[1].chapters!.series.id,
      );
    }),
  );
});
