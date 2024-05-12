import { authorsMock } from "@src/data.mock";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Author } from "@src/model";
import { beforeEach, describe, expect, it } from "bun:test";
import { AuthorPrismaRepository } from "./author.repository";
import { PrismaClient } from "@prisma/client";
import { Query } from "@src/interfaces/query";
import { resetDatabase } from "prisma/seed";

beforeEach(async () => {
  await resetDatabase();
});
const client = new PrismaClient();
const authorTestRepository = new AuthorPrismaRepository(client);
describe("Author Repository", () => {
  it("读取单个", async () => {
    const id = 1;
    const result = await authorTestRepository.getById(id);

    const expectedAuthor: Required<Author> = authorsMock[id - 1];
    expect(result).toEqual(expectedAuthor);
  });

  it("读取列表", async () => {
    const pagination: Query = { size: 10, current: 1 };
    const result = await authorTestRepository.list(pagination);
    const expectedArticle: PaginatedResponse<Required<Author>[]> = {
      detail: authorsMock,
      pagination: {
        items: 3,
        pages: 1,
        size: 10,
        current: 1,
      },
    };

    expect(result).toEqual(expectedArticle);
  });
});
