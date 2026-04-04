import { Database } from "bun:sqlite";
import { expect, test, describe } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { createArticleSerive } from "./create.service";
import { env } from "bun";

interface getSQLViewResult {
  id: number;
  title: string;
  body: string;
  chapter_id: string | null;
  chapter_order: number | null;
  series_id: string | null;
  series_title: string | null;
  author_id: string;
  people_id: string;
  people_name: string;
}

const createSql = await Bun.file("./script/create.sql").text();
const testCases = Object.freeze([
  Object.freeze({
    name: "正常创建文章1",
    input: Object.freeze({
      title: "test",
      body: "测试内容",
      author: { name: "test author1" },
      chapter: { title: "系列1", order: 2.5 },
    }),
    expectOk: true,
  }),
  Object.freeze({
    name: "正常创建文章2",
    input: Object.freeze({
      title: "test",
      body: "测试内容",
      author: { name: "test author1" },
    }),
    expectOk: true,
  }),
  Object.freeze({
    name: "标题为空失败",
    input: Object.freeze({
      title: "",
      body: "内容",
      author: { name: "author2" },
    }),
    expectOk: false,
    expectedErrMsg: "Invalid input",
  }),
  Object.freeze({
    name: "作者为空失败",
    input: Object.freeze({
      title: "valid title",
      body: "内容",
      author: { name: "" },
    }),
    expectOk: false,
    expectedErrMsg: "Invalid input",
  }),
]);

// 创建数据库实例，每个测试用例独立
const createDb = (): Database =>
  new Database(env.DATABASE_URI, { create: true });

// 运行单个测试用例
const runTestCase =
  (inputCase: (typeof testCases)[number]) => async (): Promise<void> => {
    const db = createDb();
    const client = drizzle(db);
    db.run(createSql);
    const service = await createArticleSerive(client);

    const result = await service.execute(inputCase.input);

    if (inputCase.expectOk) {
      // 成功用例断言
      expect(result.isOk()).toEqual(true);
      const articleId = result.unwrap();

      const read = db
        .query("SELECT * FROM library ORDER BY id DESC LIMIT 1")
        .get() as getSQLViewResult;

      const readKeyword = db
        .query(`SELECT * FROM keyword_index_view WHERE article_id = $id`)
        .get({ id: articleId });
      console.log(readKeyword);
      expect(articleId).toEqual(read.id);
      expect(read.title).toEqual(inputCase.input.title);
      expect(read.body).toEqual(inputCase.input.body);
      expect(read.people_name).toEqual(inputCase.input.author.name);

      // chapter 可选处理
      if ("chapter" in inputCase.input && inputCase.input.chapter) {
        expect(read.series_title).toEqual(inputCase.input.chapter.title);
        expect(read.chapter_order).toEqual(inputCase.input.chapter.order);
      } else {
        // chapter 为空时数据库字段应该为 null
        expect(read.series_title).toBeNull();
        expect(read.chapter_order).toBeNull();
      }
    } else {
      // 失败用例断言，不访问数据库
      expect(result.isErr()).toEqual(true);
      const err = result.unwrapErr();
      if (inputCase.expectedErrMsg) {
        expect(err.message).toContain(inputCase.expectedErrMsg);
      }
    }
  };

describe("application articles - fully isolated functional tests", () => {
  testCases.forEach((c) => {
    test(c.name, runTestCase(c));
  });
});
