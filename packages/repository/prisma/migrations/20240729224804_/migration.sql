/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `authors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[article_id]` on the table `chapters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `series` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "articles_authors" DROP CONSTRAINT "articles_authors_article_id_fkey";

-- DropForeignKey
ALTER TABLE "articles_authors" DROP CONSTRAINT "articles_authors_author_id_fkey";

-- DropForeignKey
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_article_id_fkey";

-- DropForeignKey
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_series_id_fkey";

-- DropIndex
DROP INDEX "pgroonga_body_index";

-- CreateIndex
CREATE INDEX "articles_id_title_body_idx" ON "articles"("id", "title", "body");

-- CreateIndex
CREATE UNIQUE INDEX "authors_name_key" ON "authors"("name");

-- CreateIndex
CREATE INDEX "authors_id_name_idx" ON "authors"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_article_id_key" ON "chapters"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "series_title_key" ON "series"("title");

-- AddForeignKey
ALTER TABLE "articles_authors" ADD CONSTRAINT "articles_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_authors" ADD CONSTRAINT "articles_authors_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
