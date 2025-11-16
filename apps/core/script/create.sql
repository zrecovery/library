CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  body TEXT NOT NULL
);

CREATE TABLE people (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  name TEXT NOT NULL
);

-- 关系表，表示文章作者
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  person_id INTEGER REFERENCES people(id) ON DELETE CASCADE,
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE
);

-- 表示系列
CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  title TEXT NOT NULL UNIQUE
);

-- 表示文章在系列
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
  series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 1
);

CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加所有表触发器，自动更新时间戳
CREATE TRIGGER update_timestamps
  BEFORE UPDATE
  ON articles
  FOR EACH ROW
EXECUTE PROCEDURE update_timestamps();

CREATE TRIGGER update_timestamps
  BEFORE UPDATE
  ON people
  FOR EACH ROW
EXECUTE PROCEDURE update_timestamps();

CREATE TRIGGER update_timestamps
  BEFORE UPDATE
  ON authors
  FOR EACH ROW
EXECUTE PROCEDURE update_timestamps();

CREATE TRIGGER update_timestamps
  BEFORE UPDATE
  ON series
  FOR EACH ROW
EXECUTE PROCEDURE update_timestamps();

CREATE TRIGGER update_timestamps
  BEFORE UPDATE
  ON chapters
  FOR EACH ROW
EXECUTE PROCEDURE update_timestamps();

CREATE EXTENSION IF NOT EXISTS pgroonga;
CREATE INDEX pgroonga_content_index ON articles USING pgroonga (title,body);


CREATE MATERIALIZED VIEW library AS
SELECT articles.id AS id,
	articles.title AS title,
	articles.body AS body,
	chapters.id AS chapter_id,
  chapters.order AS chapter_order,
  chapters.series_id AS series_id,
  series.title AS series_title,
  authors.id AS author_id,
  people.id AS people_id,
  people.name AS people_name
FROM articles
LEFT JOIN authors ON authors.article_id = articles.id
LEFT JOIN people ON authors.person_id = people.id
LEFT JOIN chapters ON chapters.article_id = articles.id
LEFT JOIN series ON chapters.series_id = series.id;


CREATE INDEX pgroonga_view_content_index ON library USING pgroonga (title,body);
