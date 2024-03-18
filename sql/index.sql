
CREATE VIRTUAL TABLE articles_fts USING fts5(title, body, content='articles', content_rowid='id');
INSERT INTO articles_fts(rowid, title, body ) SELECT id, title, body FROM articles;
