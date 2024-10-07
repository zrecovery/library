import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { articles, series, people, authors, chapters } from "../scheme";
import { eq } from "drizzle-orm";
import type { Id } from "../../domain/model";

export const findArticleByTitle = (db: PostgresJsDatabase) => (title: string) =>
  db
    .select({ id: articles.id, title: articles.title, body: articles.body })
    .from(articles)
    .where(eq(articles.title, title));

export const findArticleById = (db: PostgresJsDatabase) => (id: Id) =>
  db
    .select()
    .from(articles)
    .innerJoin(authors, eq(authors.article_id, articles.id))
    .innerJoin(people, eq(authors.person_id, people.id))
    .innerJoin(chapters, eq(chapters.article_id, articles.id))
    .innerJoin(series, eq(chapters.series_id, series.id))
    .where(eq(articles.id, id));

export const findPerson = (db: PostgresJsDatabase) => (name: string) =>
  db
    .select({ id: people.id, name: people.name })
    .from(people)
    .where(eq(people.name, name));

export const findAuthor = (db: PostgresJsDatabase) => (article_id: Id) =>
  db
    .select({
      id: authors.id,
      article_id: authors.article_id,
      person_id: authors.person_id,
    })
    .from(authors)
    .where(eq(authors.article_id, article_id));

export const findSeries = (db: PostgresJsDatabase) => (title: string) =>
  db
    .select({
      id: series.id,
      title: series.title,
    })
    .from(series)
    .where(eq(series.title, title));

export const findChapter = (db: PostgresJsDatabase) => (article_id: Id) =>
  db
    .select({
      id: chapters.id,
      article_id: chapters.article_id,
      series_id: chapters.series_id,
      order: chapters.order,
    })
    .from(chapters)
    .where(eq(chapters.article_id, article_id));
