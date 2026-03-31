import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
  index,
  sqliteView,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/* -------------------------------- articles -------------------------------- */

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    title: text("title").notNull(),
    body: text("body").notNull(),
  },
  (table) => ({
    createdAtIdx: index("idx_articles_created_at").on(table.createdAt),
  }),
);

/* -------------------------------- people -------------------------------- */

export const people = sqliteTable(
  "people",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    name: text("name").notNull(),
  },
  (table) => ({
    nameIdx: index("idx_people_name").on(table.name),
  }),
);

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
  (table) => ({
    articleIdx: index("idx_authors_article").on(table.articleId),

    personIdx: index("idx_authors_person").on(table.personId),

    uniqueAuthor: uniqueIndex("authors_unique_person_article").on(
      table.personId,
      table.articleId,
    ),
  }),
);

/* -------------------------------- series -------------------------------- */

export const series = sqliteTable("series", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

  title: text("title").notNull().unique(),
});

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
  (table) => ({
    articleIdx: index("idx_chapters_article").on(table.articleId),

    seriesIdx: index("idx_chapters_series").on(table.seriesId),

    uniqueSeriesOrder: uniqueIndex("chapters_unique_series_order").on(
      table.seriesId,
      table.order,
    ),

    uniqueArticleSeries: uniqueIndex("chapters_unique_article_series").on(
      table.articleId,
      table.seriesId,
    ),
  }),
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
  (table) => ({
    keywordUnique: uniqueIndex("keywords_unique_keyword").on(table.keyword),
    keywordIdx: index("idx_keywords_keyword").on(table.keyword),
  }),
);

/* ---------------------------- article_keywords ---------------------------- */

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
  (table) => ({
    articleIdx: index("idx_article_keywords_article").on(table.articleId),

    keywordIdx: index("idx_article_keywords_keyword").on(table.keywordId),

    uniqueArticleKeyword: uniqueIndex("article_keywords_unique").on(
      table.articleId,
      table.keywordId,
    ),
  }),
);

export const library = sqliteView("library").as((qb) =>
  qb
    .select({
      id: articles.id,
      title: articles.title,
      body: articles.body,

      chapterId: chapters.id,
      chapterOrder: chapters.order,
      seriesId: chapters.seriesId,

      seriesTitle: series.title,

      authorId: authors.id,
      peopleId: people.id,
      peopleName: people.name,
    })
    .from(articles)
    .leftJoin(authors, sql`${authors.articleId} = ${articles.id}`)
    .leftJoin(people, sql`${authors.personId} = ${people.id}`)
    .leftJoin(chapters, sql`${chapters.articleId} = ${articles.id}`)
    .leftJoin(series, sql`${chapters.seriesId} = ${series.id}`),
);

export const keywordIndexView = sqliteView("keyword_index_view").as((qb) =>
  qb
    .select({
      articleId: articleKeywords.articleId,
      keyword: keywords.keyword,
      count: articleKeywords.count,
    })
    .from(articleKeywords)
    .innerJoin(keywords, sql`${articleKeywords.keywordId} = ${keywords.id}`),
);
