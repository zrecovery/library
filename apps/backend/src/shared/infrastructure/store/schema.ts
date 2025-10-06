import { eq, relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  pgView,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  title: text("title").notNull(),
  body: text("body").notNull(),
});

export const people = pgTable("people", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  name: text("name").notNull(),
});

export const authors = pgTable("authors", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  person_id: integer("person_id")
    .references(() => people.id)
    .notNull(),
  article_id: integer("article_id")
    .references(() => articles.id)
    .notNull(),
});

export const peopleRelations = relations(people, ({ many }) => ({
  authors: many(authors),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  authors: one(authors),
  chapters: one(chapters),
}));

export const authorsRelations = relations(authors, ({ one }) => ({
  article: one(articles, {
    fields: [authors.article_id],
    references: [articles.id],
  }),
  person: one(people, {
    fields: [authors.person_id],
    references: [people.id],
  }),
}));

export const series = pgTable("series", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  title: text("title").unique().notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  order: integer("order").default(1).notNull(),
  article_id: integer("article_id")
    .references(() => articles.id)
    .notNull()
    .unique(),
  series_id: integer("series_id")
    .references(() => series.id)
    .notNull()
    .notNull(),
});

export const seriesRelations = relations(series, ({ many }) => ({
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  article: one(articles, {
    fields: [chapters.article_id],
    references: [articles.id],
  }),
  series: one(series, {
    fields: [chapters.series_id],
    references: [series.id],
  }),
}));

export const libraryView = pgView("library", {
  id: integer("id"),
  title: text("title"),
  body: text("body"),
  chapter_id: integer("chapter_id"),
  chapter_order: real("chapter_order"),
  series_id: integer("series_id"),
  series_title: text("series_title"),
  author_id: integer("author_id"),
  people_id: integer("people_id"),
  people_name: text("people_name"),
}).existing();
