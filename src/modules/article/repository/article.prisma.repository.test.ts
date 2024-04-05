import { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "bun:test";
import { ArticlePrismaRepository } from "./article.prisma.repository";
import { QueryResult } from "@src/core/schema/query-result.schema";
import { Query } from "@src/core/article/article.repository";
import { Pagination } from "@src/core/schema/pagination.schema";
import { seed } from "prisma/seed";
import { articlesMock } from "./article.test.data";
import {
  ArticleEntity,
  ArticleUpdated,
} from "@src/core/article/article.schema";
import { articleEntitySelect, queryArticle } from "../article.repository.util";

const testClient = new PrismaClient();
const articleTestRepository = new ArticlePrismaRepository(testClient);

beforeEach(async () => {
  await seed();
});

describe("Article Repository", () => {
  it("读取单个", async () => {
    const id = 1;
    const result = await articleTestRepository.getById(id);

    const expectedArticle: QueryResult<ArticleEntity> = {
      detail: articlesMock[id - 1],
    };
    expect(result).toEqual(expectedArticle);
  });

  it("读取列表", async () => {
    const query: Query = {
      keyword: "工作",
    };

    const pagination: Pagination = { size: 10, page: 1 };
    const result = await articleTestRepository.search(query, pagination);
    const expectedArticle: QueryResult<ArticleEntity[]> = {
      detail: articlesMock.slice(3, 4),
      paging: {
        total: 1,
        page: 1,
        size: 10,
      },
    };

    expect(result).toEqual(expectedArticle);
  });

  it("创建一篇文章", async () => {
    const { title, body, author, love, book, order } = articlesMock[0];
    const testIndex = 1;
    const createArticle = {
      title: `${title}${testIndex}`,
      body,
      author,
      love,
      book,
      order,
    };
    await articleTestRepository.create(createArticle);
    const article = await testClient.article.findFirstOrThrow({
      where: { title: `${title}${testIndex}` },
    });

    const expectedArticle = {
      title: createArticle.title,
      body,
      love,
      author_id: articlesMock[0].author_id,
      id: article.id,
    };

    expect(article).toEqual(expectedArticle);
  });

  it("修改一篇文章", async () => {
    const article: ArticleUpdated = {
      id: 4,
      title: "古代人的故事2",
      body: "描绘了一位古代人的故事，和他们的工作。",
      author: "赵六",
      author_id: 2,
      order: 1,
      book: "影之谷的秘密",
      book_id: 3,
      love: true,
    };

    const articleMock: queryArticle = {
      id: 4,
      title: "古代人的故事2",
      body: "描绘了一位古代人的故事，和他们的工作。",
      chapter: {
        chapter_order: 1,
        book: {
          id: 2,
          title: "影之谷的秘密",
        },
      },
      author: {
        id: 1,
        name: "赵六",
      },
      love: true,
    };

    await articleTestRepository.update(article);
    const result = await testClient.article.findFirst({
      select: articleEntitySelect,
      where: { id: article.id },
    });
    expect(result).toEqual(articleMock);
  });

  it("删除一篇文章", async () => {
    const deleteID = 1;

    await articleTestRepository.delete(deleteID);
    const article = await testClient.article.findFirst({
      where: { id: deleteID },
    });
    expect(article).toBeNull();
  });

  it("搜索一系列文章", async () => {
    const keyword = "世界";
    const result = await articleTestRepository.search(
      { keyword },
      { size: 10, page: 1 },
    );
    const includes = result.detail
      .map((article) => article.body.includes(keyword))
      .filter((r) => r === true);
    expect(includes.length).toBe(2);
  });
});
