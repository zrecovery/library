import { describe, expect, test } from "bun:test";
import type { ArticleCreate } from "../../domain/model";
import { StoreErrorType } from "../store.error";
import { createContextLogger } from "../../utils/logger";
import { expectError, withTestDb } from "../../utils/test";
import { create } from "./create";
import { articles, series } from "../scheme";
import { eq } from "drizzle-orm";

const logger = createContextLogger("ArticleCreateTest");

describe("Article Creation", () => {
  describe("Validation", () => {
    test(
      "should reject empty title",
      withTestDb(async (db) => {
        const input: ArticleCreate = {
          title: "",
          body: "Test body",
          author: { name: "Test Author" },
        };

        await expectError(
          create(db)(input),
          StoreErrorType.ValidationError,
          "title is required",
        );
      }),
    );

    test(
      "should reject empty body",
      withTestDb(async (db) => {
        const input: ArticleCreate = {
          title: "Test Title",
          body: "",
          author: { name: "Test Author" },
        };

        await expectError(
          create(db)(input),
          StoreErrorType.ValidationError,
          "body is required",
        );
      }),
    );

    test(
      "should reject missing author",
      withTestDb(async (db) => {
        const input: ArticleCreate = {
          title: "Test Title",
          body: "Test body",
          author: { name: "" },
        };

        await expectError(
          create(db)(input),
          StoreErrorType.ValidationError,
          "Author name is required",
        );
      }),
    );
  });

  describe("Success Cases", () => {
    test(
      "should create article with required fields",
      withTestDb(async (db) => {
        const input: ArticleCreate = {
          title: "Test Title",
          body: "Test body",
          author: { name: "Test Author" },
        };

        await create(db)(input);

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

        await create(db)(input);

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
        db.transaction(async (trx) => {
          await create(db)(input1);
          await create(db)(input2);

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
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          expect(results[0].chapters?.series.id).toBe(results[1].chapters!.series.id,
          );
        });
      }),
    );
  });
});
