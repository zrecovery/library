import { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "bun:test";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { Pagination } from "@src/core/schema/pagination.schema";
import { seed } from "prisma/seed";
import { AuthorPrismaRepository } from "./author.repository";
import { AuthorEntity } from "@src/core/schema/author.schema";
import { Author } from "@src/core/author/author.model";

const authorEntities: AuthorEntity[] = [
  {
    id: 1,
    name: "赵六",
    books: [
      {
        title: "晨光下的诺言",
        id: 1,
      },
      {
        title: "影之谷的秘密",
        id: 2,
      },
    ],
  },
  {
    id: 2,
    name: "李四",
    books: [
      {
        title: "风之谷的回声",
        id: 3,
      },
    ],
  },
];

const authorsMock = [
  {
    id: 1,
    name: "赵六",
  },
  {
    id: 2,
    name: "李四",
  },
];

const testClient = new PrismaClient();
const authorTestRepository = new AuthorPrismaRepository(testClient);

beforeEach(async () => {
  await seed();
});

describe("Author Repository", () => {
  it("读取单个", async () => {
    const id = 1;
    const pagination: Pagination = { size: 10, page: 1 };
    const result = await authorTestRepository.getById(id, pagination);

    const expectedAuthor: QueryResult<AuthorEntity> = {
      detail: authorEntities[id - 1],
      paging: {
        total: 1,
        page: 1,
        size: 10,
      },
    };
    expect(result).toEqual(expectedAuthor);
  });

  it("读取列表", async () => {
    const pagination: Pagination = { size: 10, page: 1 };
    const result = await authorTestRepository.list(pagination);
    const expectedArticle: QueryResult<Author[]> = {
      detail: authorsMock,
      paging: {
        total: 1,
        page: 1,
        size: 10,
      },
    };

    expect(result).toEqual(expectedArticle);
  });
});
