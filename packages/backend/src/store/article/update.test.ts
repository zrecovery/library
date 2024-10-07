import { beforeEach, expect, test } from "bun:test";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { mockDB } from "../test/mock";
import { update } from "./update";
import type { Id, UpdateArticle } from "../../domain/model";
import { findArticleById } from "../test/query";
import type { StoreErrorType } from "../store.error";

const test_uri = "postgres://postgres:postgres@localhost:5432/test";
const queryClient = postgres(test_uri);
const db = drizzle(queryClient);

interface TestStruct {
  title: string;
  input: UpdateArticle;
  error?: StoreErrorType | string;
  expect: {
    articles: {
      id: Id;
      body: string;
      title: string;
    };
    people: { name: string };
    chapters: { order: number };
    series: { title: string };
  };
}

beforeEach(async () => {
  await mockDB(db);
});

const cases: TestStruct[] = [
  {
    title:
      "should update a new article content with existed author, series and create new series and author",
    input: {
      id: 1,
      title: "new blog",
      body: "new blog body",
      author: { name: "new author" },
      chapter: { title: "new books", order: 1 },
    },
    error: undefined,
    expect: {
      articles: {
        id: 1,
        title: "new blog",
        body: "new blog body",
      },
      people: { name: "new author" },
      chapters: { order: 1 },
      series: { title: "new books" },
    },
  },
];

const l = (result: Array<object>, expe: object) => {
  expect(result.length).toEqual(1);
  expect(result).toMatchObject([expe]);
};

const testCase = (c: TestStruct) => {
  test(c.title, async () => {
    const action = update(db)(c.input.id, c.input);

    if (c.error) {
      expect(async () => {
        await action;
      }).toThrowError(c.error);
    } else {
      expect(await action).toBeEmpty();
      const article = await findArticleById(db)(c.input.id);
      l(article, c.expect);
    }
  });
};

cases.map(testCase);
