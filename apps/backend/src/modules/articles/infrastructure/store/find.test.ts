import { describe, expect, test } from "bun:test";
import { withTestDb } from "@utils/test";

import { articles } from "@shared/infrastructure/store/schema";
import { eq } from "drizzle-orm";
import { createDrizzleFinder } from "./find";

describe("Success Cases", () => {
  test(
    "should create article with required fields",
    withTestDb(async (db) => {
      const input = 1;

      const finder = createDrizzleFinder(db);
      const result = await finder.find(input);

      const response = await db.query.articles.findFirst({
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
        where: eq(articles.id, input),
      });

      expect(result).toBeDefined();
      expect(result.isOk()).toBeTrue();
      const r = result.unwrap();
      if (response) {
        expect(r.title).toEqual(response.title);
        if (response.chapters) {
          expect(r.chapter?.id).toEqual(response.chapters?.series_id);
          expect(r.chapter?.title).toEqual(response.chapters?.series.title);
          expect(r.chapter?.order).toEqual(response.chapters?.order);
        }
        if (response.authors) {
          expect(r.author.id).toEqual(response.authors?.person_id);
          expect(r.author.name).toEqual(response.authors?.person.name);
        }
      }
    }),
  );
});
