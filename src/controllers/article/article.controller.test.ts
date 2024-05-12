import {
  articlesMock,
  authorsMock,
  chaptersMock,
  seriesMock,
} from "@src/data.mock";
import { beforeEach, describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { resetDatabase } from "prisma/seed";
import { ArticleController } from "./article.controller";
import { IArticleResponse } from "@src/interfaces/response.interface";

function convertDatesToString(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj; // 如果不是对象，直接返回
  }

  if (Array.isArray(obj)) {
    // 如果是数组，递归处理每个元素
    return obj.map(convertDatesToString);
  }

  // 如果是对象，创建一个新的对象，并递归处理每个属性
  const newObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];

      // 检查是否为Date类型，并且是created_at或updated_at字段
      if (
        value instanceof Date &&
        (key === "created_at" || key === "updated_at")
      ) {
        value = value.toISOString(); // 转换为ISO字符串
      } else if (typeof value === "object") {
        value = convertDatesToString(value); // 递归处理嵌套对象
      }

      newObj[key] = value;
    }
  }

  return newObj;
}

const articlePageMock = {
  items: 4,
  pages: 1,
  current: 1,
  size: 10,
};

describe("Articles", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  const app = new Elysia();
  app.use(ArticleController);
  app.listen(3001);

  it("返回单个", async () => {
    const input = { id: 1 };
    const expected: IArticleResponse = {
      detail: {
        ...articlesMock.filter((a) => a.id === input.id)[0],
        series: seriesMock[0],
        authors: authorsMock.slice(0, 1),
        order: chaptersMock.filter((c) => c.article_id === input.id)[0].order,
      },
    };

    const response = await app
      .handle(new Request("http://localhost:3001/articles/1"))
      .then(async (res) => await res.json());
    expect(response).toEqual(convertDatesToString(expected));
  });

  it("返回列表", async () => {
    const mockResponse = {
      detail: articlesMock,
      pagination: articlePageMock,
    };

    const response = await app
      .handle(new Request("http://localhost:3001/articles"))
      .then(async (res) => await res.json());

    expect(response).toEqual(convertDatesToString(mockResponse));
  });
});
