CREATE TABLE base (
  id SERIAL PRIMARY KEY,
  create_at TIMESTAMP NOT NULL DEFAULT now(),
  update_at TIMESTAMP NOT NULL DEFAULT now(),
);

CREATE TABLE articles (
  title TEXT NOT NULL,
  body TEXT NOT NULL
) INHERITS (base);

CREATE TABLE people (
  name TEXT NOT NULL unique,
) INHERITS (base);

-- 关系表，表示文章作者
CREATE TABLE authors (
  author_id INTEGER REFERENCES people(id),
  article_id INTEGER REFERENCES articles(id) unique
) INHERITS (base);

-- 表示系列
CREATE TABLE series (
  title TEXT NOT NULL unique,
) INHERITS (base);

-- 表示文章在系列
CREATE TABLE chapters (
  article_id INTEGER REFERENCES articles(id) unique,  
  chapter_id INTEGER REFERENCES chapters(id),
  order REAL NOT NULL DEFAULT 1.0,
) INHERITS (base);

