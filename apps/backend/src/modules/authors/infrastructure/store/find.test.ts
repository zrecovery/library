import { describe, expect, test } from "bun:test";
import { withTestDb } from "@utils/test";

import {
  articles,
  authors,
  chapters,
  people,
  series,
} from "@shared/infrastructure/store/schema";
import { Finder } from "./find";

describe("Author Finder Success Cases", () => {
  test(
    "should find author with articles and chapters",
    withTestDb(async (db) => {
      // 插入测试数据
      const [person] = await db
        .insert(people)
        .values({ name: "Test Author" })
        .returning();

      const [article] = await db
        .insert(articles)
        .values({
          title: "Test Article",
          body: "Test content",
        })
        .returning();

      const [serie] = await db
        .insert(series)
        .values({ title: "Test Series" })
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

      const finder = new Finder(db);
      const result = await finder.find(person.id);

      expect(result).toBeDefined();
      expect(result.isOk()).toBeTrue();

      const authorDetail = result.unwrap();
      expect(authorDetail.id).toEqual(person.id);
      expect(authorDetail.name).toEqual("Test Author");
      expect(authorDetail.articles.length).toBe(1);
      expect(authorDetail.articles[0].title).toEqual("Test Article");
      expect(authorDetail.chapters.length).toBe(1);
      expect(authorDetail.chapters[0].title).toEqual("Test Series");
    }),
  );

  test(
    "should find author with multiple articles",
    withTestDb(async (db) => {
      // 插入测试数据
      const [person] = await db
        .insert(people)
        .values({ name: "Test Author" })
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
        person_id: person.id,
        article_id: article1.id,
      });

      await db.insert(authors).values({
        person_id: person.id,
        article_id: article2.id,
      });

      const finder = new Finder(db);
      const result = await finder.find(person.id);

      expect(result).toBeDefined();
      expect(result.isOk()).toBeTrue();

      const authorDetail = result.unwrap();
      expect(authorDetail.id).toEqual(person.id);
      expect(authorDetail.name).toEqual("Test Author");
      expect(authorDetail.articles.length).toBe(2);
    }),
  );
});

describe("Author Finder Error Cases", () => {
  test(
    "should return NotFoundStoreError when author does not exist",
    withTestDb(async (db) => {
      const finder = new Finder(db);
      const result = await finder.find(99999); // Non-existent ID

      expect(result).toBeDefined();
      expect(result.isErr()).toBeTrue();

      const error = result.unwrapErr();
      expect(error.constructor.name).toBe("NotFoundStoreError");
    }),
  );
});
