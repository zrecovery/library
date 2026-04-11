import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
  index,
  sqliteView,
  real,
} from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

/* -------------------------------- articles -------------------------------- */

export const articles = sqliteTable(
  "articles",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    title: text("title").notNull(),
    body: text("body").notNull(),
  },
  (table) => [index("idx_articles_created_at").on(table.createdAt)],
);

export const insertArticleSchema = createInsertSchema(articles);

export const people = sqliteTable(
  "people",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    name: text("name").notNull(),
  },
  (table) => [index("idx_people_name").on(table.name)],
);

export const insertPersonSchema = createInsertSchema(people);

/* -------------------------------- authors -------------------------------- */

export const authors = sqliteTable(
  "authors",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    personId: integer("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),

    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_authors_article").on(table.articleId),

    index("idx_authors_person").on(table.personId),

    uniqueIndex("authors_unique_person_article").on(
      table.personId,
      table.articleId,
    ),
  ],
);

/* -------------------------------- series -------------------------------- */

export const series = sqliteTable("series", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

  title: text("title").notNull().unique(),
});

export const insertSeriesSchema = createInsertSchema(series);

/* -------------------------------- chapters -------------------------------- */

export const chapters = sqliteTable(
  "chapters",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),

    seriesId: integer("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),

    order: integer("order").notNull().default(1),
  },
  (table) => [
    index("idx_chapters_article").on(table.articleId),

    index("idx_chapters_series").on(table.seriesId),

    uniqueIndex("chapters_unique_series_order").on(table.seriesId, table.order),

    uniqueIndex("chapters_unique_article_series").on(
      table.articleId,
      table.seriesId,
    ),
  ],
);

/* -------------------------------- keywords -------------------------------- */

export const keywords = sqliteTable(
  "keywords",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    keyword: text("keyword").notNull(),
  },
  (table) => [
    uniqueIndex("keywords_unique_keyword").on(table.keyword),
    index("idx_keywords_keyword").on(table.keyword),
  ],
);

export const insertKeywordSchema = createInsertSchema(keywords);

export const articleKeywords = sqliteTable(
  "article_keywords",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),

    keywordId: integer("keyword_id")
      .notNull()
      .references(() => keywords.id, { onDelete: "cascade" }),

    count: integer("count").notNull().default(1),
  },
  (table) => [
    index("idx_article_keywords_article").on(table.articleId),

    index("idx_article_keywords_keyword").on(table.keywordId),

    uniqueIndex("article_keywords_unique").on(table.articleId, table.keywordId),
  ],
);

export const library = sqliteView("library", {
  id: integer("id").primaryKey(),
  title: text("title"),
  body: text("body"),
  chapterId: integer("series_id"),
  chapterTitle: text("series_title"),
  chapterOrder: real("chapter_order"),
  authorId: integer("author_id"),
  authorName: text("people_name"),
}).existing();
export const selectLibraryViewSchema = createSelectSchema(library);

export const keywordIndexView = sqliteView("keyword_index_view", {
  articleId: integer("article_id"),
  keyword: text("keyword"),
  count: integer("count"),
}).existing();
