import { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "bun:test";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { Pagination } from "@src/core/schema/pagination.schema";
import { seed } from "prisma/seed";
import { Book } from "@src/core/book/book.model";
import { BookPrismaRepository } from "./book.prisma.repository";
import { BookEntity } from "@src/core/book/book.repository";

const books: Book[] = [
  {
    author: "赵六",
    title: "晨光下的诺言",
    id: 1,
  },
  {
    author: "赵六",
    title: "影之谷的秘密",
    id: 2,
  },
  {
    author: "李四",
    id: 3,
    title: "风之谷的回声",
  },
];

const bookEntity: BookEntity = {
  id: 1,
  title: "晨光下的诺言",
  articles: [
    {
      id: 1,
      title: "寂静海洋中的歌声",
      body: "一本描绘深海中神秘生物与海洋奥秘的小说，通过主人公的探险旅程，展现了一个宁静而生动的海底世界。",
      author: "赵六",
      author_id: 1,
      order: 1,
    },
  ],
};
const testClient = new PrismaClient();
const bookTestRepository = new BookPrismaRepository(testClient);

beforeEach(async () => {
  await seed();
});

describe("Book Repository", () => {
  it("读取单个书籍", async () => {
    const id = 1;
    const pagination: Pagination = { size: 10, page: 1 };
    const result = await bookTestRepository.getById(id, pagination);

    const expectedBook: QueryResult<BookEntity> = {
      detail: bookEntity,
      paging: {
        total: 1,
        page: 1,
        size: 10,
      },
    };
    expect(result).toEqual(expectedBook);
  });

  it("读取列表", async () => {
    const pagination: Pagination = { size: 10, page: 1 };
    const result = await bookTestRepository.list(pagination);
    const expectedArticle: QueryResult<Book[]> = {
      detail: books,
      paging: {
        total: 1,
        page: 1,
        size: 10,
      },
    };

    expect(result).toEqual(expectedArticle);
  });
});
