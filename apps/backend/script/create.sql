CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  create_at TIMESTAMP NOT NULL DEFAULT now(),
  update_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  body TEXT NOT NULL
);

CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  create_at TIMESTAMP NOT NULL DEFAULT now(),
  update_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL unique
);

-- 关系表，表示文章作者
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  create_at TIMESTAMP NOT NULL DEFAULT now(),
  update_at TIMESTAMP NOT NULL DEFAULT now(),
  person_id INTEGER REFERENCES people(id),
  article_id INTEGER REFERENCES articles(id) unique
);

-- 表示系列
CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  create_at TIMESTAMP NOT NULL DEFAULT now(),
  update_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL unique
);

-- 表示文章在系列
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  create_at TIMESTAMP NOT NULL DEFAULT now(),
  update_at TIMESTAMP NOT NULL DEFAULT now(),
  article_id INTEGER REFERENCES articles(id) unique,
  series_id INTEGER REFERENCES series(id),
  "order" REAL NOT NULL DEFAULT 1.0
);

create extension if not exists pgroonga;
CREATE INDEX pgroonga_content_index ON articles USING pgroonga (title,body);