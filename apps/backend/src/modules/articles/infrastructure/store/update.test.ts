import { describe, expect, test } from "bun:test";
import { StoreErrorTag } from "@shared/domain/interfaces/store.error";
import { findArticleById } from "@shared/infrastructure/store/test/query";
import { expectError, withTestDb } from "@utils/test";

import type { Database } from "@shared/infrastructure/store/db";
import { DrizzleUpdater } from "./update";

describe("Article Update", () => {
  const cases = [
    {
      title:
        "should update a new article content with existed author, series and create new series and author",
      input: {
        id: 1,
        title: "new blog",
        body: "new blog body",
        author: { name: "new author" },
        chapter: { title: "new books", order: 1 },
      },
      error: undefined,
      expect: {
        articles: {
          id: 1,
          title: "new blog",
          body: "new blog body",
        },
        people: { name: "new author" },
        chapters: { order: 1 },
        series: { title: "new books" },
      },
    },
  ];

  cases.map((c) => {
    test(
      c.title,
      withTestDb(async (db: Database) => {
        db.transaction(async (trx) => {
          const updater = new DrizzleUpdater(trx);
          const result = await updater.update(c.input.id, c.input);
          if (c.error) {
            expectError(Promise.reject(result), StoreErrorTag.UnknownError);
          } else {
            const article = findArticleById(db)(c.input.id);
            expect(article).toMatchObject({
              id: c.expect.articles.id,
              title: c.expect.articles.title,
              body: c.expect.articles.body,
              authors: { name: c.expect.people.name },
              chapters: { order: c.expect.chapters.order },
              series: { title: c.expect.series.title },
            });
          }
        });
      }),
    );
  });
});
