-- CreateTable
CREATE TABLE "articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "authors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "articles_authors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "article_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "articles_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "articles_authors_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "article_id" INTEGER NOT NULL,
    "series_id" INTEGER NOT NULL,
    "order" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chapters_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "chapters_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "series" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE VIRTUAL TABLE "search" USING fts5(title, body, content='articles', content_rowid='id');
