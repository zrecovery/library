/*
  Warnings:

  - You are about to drop the column `name` on the `authors` table. All the data in the column will be lost.
  - You are about to drop the `articles_authors` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[article_id]` on the table `authors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[person_id]` on the table `authors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `article_id` to the `authors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `person_id` to the `authors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "articles_authors" DROP CONSTRAINT "articles_authors_article_id_fkey";

-- DropForeignKey
ALTER TABLE "articles_authors" DROP CONSTRAINT "articles_authors_author_id_fkey";

-- DropIndex
DROP INDEX "authors_id_name_idx";

-- DropIndex
DROP INDEX "authors_name_key";

-- AlterTable
ALTER TABLE "authors" DROP COLUMN "name",
ADD COLUMN     "article_id" INTEGER NOT NULL,
ADD COLUMN     "person_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "articles_authors";

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "people_name_key" ON "people"("name");

-- CreateIndex
CREATE INDEX "people_id_name_idx" ON "people"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "authors_article_id_key" ON "authors"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "authors_person_id_key" ON "authors"("person_id");

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authors" ADD CONSTRAINT "authors_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE VIEW detail AS 
 SELECT ar.id,
    ar.title,
    ar.body,
    au.person_id,
    pe.name AS person,
    ch."order",
    ch.series_id,
    se.title AS chapter
   FROM articles ar
     JOIN authors au ON au.article_id = ar.id
     JOIN people pe ON au.person_id = pe.id
     JOIN chapters ch ON ar.id = ch.article_id
     JOIN series se ON ch.series_id = se.id;