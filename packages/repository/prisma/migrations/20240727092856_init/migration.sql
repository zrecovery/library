/*
  Warnings:

  - A unique constraint covering the columns `[article_id]` on the table `articles_authors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[author_id]` on the table `articles_authors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "articles_authors_article_id_key" ON "articles_authors"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_authors_author_id_key" ON "articles_authors"("author_id");

-- CreateIndex
CREATE EXTENSION IF NOT EXISTS pgroonga;
CREATE INDEX "pgroonga_body_index" ON "articles" USING pgroonga (body);
