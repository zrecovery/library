import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const initTable = async (db: PostgresJsDatabase) => {
  await db.execute(sql`
        CREATE TABLE articles (
          id SERIAL PRIMARY KEY,
          create_at TIMESTAMP NOT NULL DEFAULT now(),
          update_at TIMESTAMP NOT NULL DEFAULT now(),
          title TEXT NOT NULL,
          body TEXT NOT NULL
        );`);

  await db.execute(sql`
        CREATE TABLE people (
          id SERIAL PRIMARY KEY,
          create_at TIMESTAMP NOT NULL DEFAULT now(),
          update_at TIMESTAMP NOT NULL DEFAULT now(),
          name TEXT NOT NULL unique
        ) ;`);

  await db.execute(sql`
        CREATE TABLE authors (
          id SERIAL PRIMARY KEY,
          create_at TIMESTAMP NOT NULL DEFAULT now(),
          update_at TIMESTAMP NOT NULL DEFAULT now(),
          person_id INTEGER REFERENCES people(id) ,
          article_id INTEGER REFERENCES articles(id) UNIQUE
        ) ;`);

  await db.execute(sql`CREATE TABLE series (
          id SERIAL PRIMARY KEY,
          create_at TIMESTAMP NOT NULL DEFAULT now(),
          update_at TIMESTAMP NOT NULL DEFAULT now(),
        title TEXT NOT NULL UNIQUE) ;`);

  await db.execute(sql`CREATE TABLE chapters (
          id SERIAL PRIMARY KEY,
          create_at TIMESTAMP NOT NULL DEFAULT now(),
          update_at TIMESTAMP NOT NULL DEFAULT now(),
        article_id INTEGER REFERENCES articles(id) UNIQUE,  
        "order" INTEGER NOT NULL DEFAULT 1,
        series_id INTEGER REFERENCES series(id)
        ) ;`);
};
