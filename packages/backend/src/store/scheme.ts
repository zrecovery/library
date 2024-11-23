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
