import { describe, expect, test } from "bun:test";
import {
  articlesTable,
  authorsTable,
  chaptersTable,
  peopleTable,
  schema,
  seriesTable,
  settingsTable,
} from "./schema-bun";

describe("schema-bun", () => {
  describe("articlesTable", () => {
    test("should have correct table name", () => {
      expect(articlesTable.name).toBe("articles");
    });

    test("should have all required columns", () => {
      expect(articlesTable.columns.id.name).toBe("id");
      expect(articlesTable.columns.id.type).toBe("integer");
      expect(articlesTable.columns.title.name).toBe("title");
      expect(articlesTable.columns.title.type).toBe("text");
      expect(articlesTable.columns.body.name).toBe("body");
      expect(articlesTable.columns.body.type).toBe("text");
    });

    test("should be frozen", () => {
      expect(Object.isFrozen(articlesTable)).toBe(true);
      expect(Object.isFrozen(articlesTable.columns)).toBe(true);
    });
  });

  describe("peopleTable", () => {
    test("should have correct table name", () => {
      expect(peopleTable.name).toBe("people");
    });

    test("should have all required columns", () => {
      expect(peopleTable.columns.id.name).toBe("id");
      expect(peopleTable.columns.name.name).toBe("name");
    });

    test("should be frozen", () => {
      expect(Object.isFrozen(peopleTable)).toBe(true);
    });
  });

  describe("authorsTable", () => {
    test("should have correct table name", () => {
      expect(authorsTable.name).toBe("authors");
    });

    test("should have foreign key columns", () => {
      expect(authorsTable.columns.personId.name).toBe("person_id");
      expect(authorsTable.columns.articleId.name).toBe("article_id");
    });
  });

  describe("seriesTable", () => {
    test("should have correct table name", () => {
      expect(seriesTable.name).toBe("series");
    });

    test("should have title column", () => {
      expect(seriesTable.columns.title.name).toBe("title");
      expect(seriesTable.columns.title.type).toBe("text");
    });
  });

  describe("chaptersTable", () => {
    test("should have correct table name", () => {
      expect(chaptersTable.name).toBe("chapters");
    });

    test("should have all required columns", () => {
      expect(chaptersTable.columns.order.name).toBe("order");
      expect(chaptersTable.columns.articleId.name).toBe("article_id");
      expect(chaptersTable.columns.seriesId.name).toBe("series_id");
    });
  });

  describe("settingsTable", () => {
    test("should have correct table name", () => {
      expect(settingsTable.name).toBe("settings");
    });

    test("should have all required columns", () => {
      expect(settingsTable.columns.key.name).toBe("key");
      expect(settingsTable.columns.value.name).toBe("value");
      expect(settingsTable.columns.type.name).toBe("type");
      expect(settingsTable.columns.userId.name).toBe("user_id");
    });
  });

  describe("schema", () => {
    test("should contain all tables", () => {
      expect(schema.articles).toBe(articlesTable);
      expect(schema.people).toBe(peopleTable);
      expect(schema.authors).toBe(authorsTable);
      expect(schema.series).toBe(seriesTable);
      expect(schema.chapters).toBe(chaptersTable);
      expect(schema.settings).toBe(settingsTable);
    });

    test("should be frozen", () => {
      expect(Object.isFrozen(schema)).toBe(true);
    });
  });
});
