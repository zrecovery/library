PRAGMA foreign_keys = ON;

--------------------------------------------------
-- articles
--------------------------------------------------

CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  body TEXT NOT NULL
);

CREATE INDEX idx_articles_created_at
ON articles(created_at);

--------------------------------------------------
-- people
--------------------------------------------------

CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL
);

CREATE INDEX idx_people_name
ON people(name);

--------------------------------------------------
-- authors
--------------------------------------------------

CREATE TABLE authors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  person_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,

  FOREIGN KEY (person_id)
    REFERENCES people(id)
    ON DELETE CASCADE,

  FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE CASCADE,

  UNIQUE(person_id, article_id)
);

CREATE INDEX idx_authors_article
ON authors(article_id);

CREATE INDEX idx_authors_person
ON authors(person_id);

--------------------------------------------------
-- series
--------------------------------------------------

CREATE TABLE series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL UNIQUE
);

--------------------------------------------------
-- chapters
--------------------------------------------------

CREATE TABLE chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  article_id INTEGER NOT NULL,
  series_id INTEGER NOT NULL,

  "order" INTEGER NOT NULL DEFAULT 1,

  FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE CASCADE,

  FOREIGN KEY (series_id)
    REFERENCES series(id)
    ON DELETE CASCADE,

  UNIQUE(series_id, "order"),
  UNIQUE(article_id, series_id)
);

CREATE INDEX idx_chapters_article
ON chapters(article_id);

CREATE INDEX idx_chapters_series
ON chapters(series_id);

--------------------------------------------------
-- keywords
--------------------------------------------------

CREATE TABLE keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  keyword TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_keywords_keyword
ON keywords(keyword);

--------------------------------------------------
-- article_keywords
--------------------------------------------------

CREATE TABLE article_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  article_id INTEGER NOT NULL,
  keyword_id INTEGER NOT NULL,

  count INTEGER NOT NULL DEFAULT 1,

  FOREIGN KEY (article_id)
    REFERENCES articles(id)
    ON DELETE CASCADE,

  FOREIGN KEY (keyword_id)
    REFERENCES keywords(id)
    ON DELETE CASCADE,

  UNIQUE(article_id, keyword_id)
);

CREATE INDEX idx_article_keywords_article
ON article_keywords(article_id);

CREATE INDEX idx_article_keywords_keyword
ON article_keywords(keyword_id);

--------------------------------------------------
-- updated_at triggers
--------------------------------------------------

CREATE TRIGGER articles_update_timestamp
AFTER UPDATE ON articles
FOR EACH ROW
BEGIN
  UPDATE articles
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

CREATE TRIGGER people_update_timestamp
AFTER UPDATE ON people
FOR EACH ROW
BEGIN
  UPDATE people
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

CREATE TRIGGER authors_update_timestamp
AFTER UPDATE ON authors
FOR EACH ROW
BEGIN
  UPDATE authors
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

CREATE TRIGGER series_update_timestamp
AFTER UPDATE ON series
FOR EACH ROW
BEGIN
  UPDATE series
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

CREATE TRIGGER chapters_update_timestamp
AFTER UPDATE ON chapters
FOR EACH ROW
BEGIN
  UPDATE chapters
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

CREATE TRIGGER keywords_update_timestamp
AFTER UPDATE ON keywords
FOR EACH ROW
BEGIN
  UPDATE keywords
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

CREATE TRIGGER article_keywords_update_timestamp
AFTER UPDATE ON article_keywords
FOR EACH ROW
BEGIN
  UPDATE article_keywords
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

--------------------------------------------------
-- library view
--------------------------------------------------

CREATE VIEW library AS
SELECT
  articles.id AS id,
  articles.title AS title,
  articles.body AS body,

  chapters.id AS chapter_id,
  chapters."order" AS chapter_order,
  chapters.series_id AS series_id,

  series.title AS series_title,

  authors.id AS author_id,
  people.id AS people_id,
  people.name AS people_name

FROM articles
LEFT JOIN authors
  ON authors.article_id = articles.id

LEFT JOIN people
  ON authors.person_id = people.id

LEFT JOIN chapters
  ON chapters.article_id = articles.id

LEFT JOIN series
  ON chapters.series_id = series.id;


CREATE VIEW keyword_index_view AS
SELECT
  article_keywords.article_id AS article_id,
  keywords.keyword AS keyword,
  article_keywords.count AS count
FROM article_keywords
JOIN keywords
  ON article_keywords.keyword_id = keywords.id;
