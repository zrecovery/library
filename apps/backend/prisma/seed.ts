import { PrismaClient } from "@prisma/client";
import {
  articleAuthorRelationshipsMock,
  articlesMock,
  authorsMock,
  chaptersMock,
  seriesMock,
} from "@src/data.mock";

const prisma = new PrismaClient();
export const resetDatabase = async () => {
  // 清理数据库
  await prisma.$executeRaw`DELETE FROM "chapters"`;
  await prisma.$executeRaw`DELETE FROM "series"`;
  await prisma.$executeRaw`DELETE FROM "articles_authors"`;
  await prisma.$executeRaw`DELETE FROM "authors"`;
  await prisma.$executeRaw`DELETE FROM "articles"`;
  await prisma.$executeRaw`DELETE FROM "search"`;
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq=0 WHERE name="chapters";`;
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq=0 WHERE name="series";`;
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq=0 WHERE name="search";`;
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq=0 WHERE name="articles";`;
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq=0 WHERE name="authors";`;
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq=0 WHERE name="articles_authors";`;

  // 插入测试数据
  await prisma.article.createMany({ data: articlesMock });
  await prisma.author.createMany({ data: authorsMock });
  await prisma.series.createMany({ data: seriesMock });
  await prisma.chapter.createMany({ data: chaptersMock });
  await prisma.articles_authors.createMany({
    data: articleAuthorRelationshipsMock,
  });
  await prisma.search.createMany({
    data: articlesMock.map((a) => {
      return { rowid: a.id, title: a.title, body: a.body };
    }),
  });
};
