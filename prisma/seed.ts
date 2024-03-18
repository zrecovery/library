import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const clearTestClient = async (): Promise<void> => {
  await prisma.chapter.deleteMany();
  await prisma.book.deleteMany();
  await prisma.article.deleteMany();
  await prisma.author.deleteMany();
};

export async function seed(): Promise<void> {
  await clearTestClient();
  await prisma.author.create({ data: { id: 1, name: "赵六" } });
  await prisma.author.create({ data: { id: 2, name: "李四" } });

  await prisma.book.create({
    data: { id: 1, author_id: 1, title: "晨光下的诺言" },
  });
  await prisma.book.create({
    data: { id: 2, author_id: 1, title: "影之谷的秘密" },
  });
  await prisma.book.create({
    data: { id: 3, author_id: 2, title: "风之谷的回声" },
  });

  await prisma.article.create({
    data: {
      id: 1,
      author_id: 1,
      title: "寂静海洋中的歌声",
      body: "一本描绘深海中神秘生物与海洋奥秘的小说，通过主人公的探险旅程，展现了一个宁静而生动的海底世界。",
    },
  });
  await prisma.article.create({
    data: {
      id: 2,
      author_id: 2,
      title: "时空旅者的日记",
      body: "描绘了一位穿梭于不同历史时期的旅行者的故事，书中记录了他见证的古代文明兴衰和未来世界的变迁，是一次跨越时空的精彩冒险。",
    },
  });
  await prisma.article.create({
    data: {
      id: 3,
      author_id: 2,
      title: "古代人的故事",
      body: "描绘了一位古代人的故事，以及他们在古代文明中的生活方式。",
    },
  });
  await prisma.article.create({
    data: {
      id: 4,
      author_id: 2,
      title: "古代人的故事2",
      body: "描绘了一位古代人的故事，和他们的工作。",
    },
  });

  await prisma.chapter.create({
    data: { id: 1, article_id: 1, book_id: 1, chapter_order: 1 },
  });
  await prisma.chapter.create({
    data: { id: 2, article_id: 2, book_id: 2, chapter_order: 1 },
  });
  await prisma.chapter.create({
    data: { id: 3, article_id: 3, book_id: 3, chapter_order: 1 },
  });
  await prisma.chapter.create({
    data: { id: 4, article_id: 4, book_id: 3, chapter_order: 2 },
  });
  await prisma.$executeRaw`INSERT INTO articles_fts(rowid, title, body ) SELECT id, title, body FROM articles`;
}

await seed();
