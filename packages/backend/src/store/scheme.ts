import { relations } from "drizzle-orm";
import { integer, pgTable, real, serial, text } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey().notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
});

export const people = pgTable("people", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
});


export const authors = pgTable("authors", {
  id: serial("id").primaryKey().notNull(),
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
  title: text("title").unique().notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey().notNull(),
  order: real("order").default(1.0).notNull(),
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