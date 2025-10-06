import { describe, expect, test } from "bun:test";
import { withTestDb } from "@utils/test";

import {
  articles,
  authors,
  chapters,
  people,
  series,
} from "@shared/infrastructure/store/schema";
import { eq } from "drizzle-orm";
import { DrizzleFinder } from "./finder";

describe("Chapter Finder Success Cases", () => {
  test(
    "should find chapter with articles",
    withTestDb(async (db) => {
      // 插入测试数据
      const [person] = await db
        .insert(people)
        .values({ name: "Test Author" })
        .returning();

      const [serie] = await db
        .insert(series)
        .values({ title: "Test Series" })
        .returning();

      const [article] = await db
        .insert(articles)
        .values({
          title: "Test Article",
          body: "Test content",
        })
        .returning();

      await db.insert(authors).values({
        person_id: person.id,
        article_id: article.id,
      });

      await db.insert(chapters).values({
        article_id: article.id,
        series_id: serie.id,
        order: 1,
      });

      const finder = new DrizzleFinder(db);
      const result = await finder.find(serie.id);

      expect(result).toBeDefined();
      expect(result.isOk()).toBeTrue();

      const chapterDetail = result.unwrap();
      expect(chapterDetail.id).toEqual(serie.id);
      expect(chapterDetail.title).toEqual("Test Series");
      expect(chapterDetail.articles.length).toBe(1);
      expect(chapterDetail.articles[0].title).toEqual("Test Article");
    }),
  );

  test(
    "should find chapter with multiple articles",
    withTestDb(async (db) => {
      // 插入测试数据
      const [person1] = await db
        .insert(people)
        .values({ name: "Test Author 1" })
        .returning();
      const [person2] = await db
        .insert(people)
        .values({ name: "Test Author 2" })
        .returning();

      const [serie] = await db
        .insert(series)
        .values({ title: "Test Series" })
        .returning();

      const [article1] = await db
        .insert(articles)
        .values({
          title: "Test Article 1",
          body: "Test content 1",
        })
        .returning();

      const [article2] = await db
        .insert(articles)
        .values({
          title: "Test Article 2",
          body: "Test content 2",
        })
        .returning();

      await db.insert(authors).values({
        person_id: person1.id,
        article_id: article1.id,
      });

      await db.insert(authors).values({
        person_id: person2.id,
        article_id: article2.id,
      });

      await db.insert(chapters).values({
        article_id: article1.id,
        series_id: serie.id,
        order: 1,
      });

      await db.insert(chapters).values({
        article_id: article2.id,
        series_id: serie.id,
        order: 2,
      });

      const finder = new DrizzleFinder(db);
      const result = await finder.find(serie.id);

      expect(result).toBeDefined();
      expect(result.isOk()).toBeTrue();

      const chapterDetail = result.unwrap();
      expect(chapterDetail.id).toEqual(serie.id);
      expect(chapterDetail.title).toEqual("Test Series");
      expect(chapterDetail.articles.length).toBe(2);
    }),
  );
});

describe("Chapter Finder Error Cases", () => {
  test(
    "should return NotFoundStoreError when chapter does not exist",
    withTestDb(async (db) => {
      const finder = new DrizzleFinder(db);
      const result = await finder.find(99999); // Non-existent ID

      expect(result).toBeDefined();
      expect(result.isErr()).toBeTrue();

      const error = result.unwrapErr();
      expect(error.constructor.name).toBe("NotFoundStoreError");
    }),
  );
});
