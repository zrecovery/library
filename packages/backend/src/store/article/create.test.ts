import { beforeEach, expect, test } from "bun:test";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { mockDB } from "../test/mock";
import { create } from "./create";
import type { ArticleCreate } from "../../domain/model";
import {
  findAuthor,
  findPerson,
  findArticleByTitle,
  findSeries,
  findChapter,
} from "../test/query";
import type { StoreErrorType } from "../store.error";

const test_uri = "postgres://postgres:postgres@localhost:5432/test";
const queryClient = postgres(test_uri);
const db = drizzle(queryClient);

interface TestStruct {
  title: string;
  input: ArticleCreate;
  expect: {
    error?: StoreErrorType | string;
    title?: string;
    body?: string;
    person?: { name: string };
    chapter?: { order: number };
    series?: { title: string };
  };
}

beforeEach(async () => {
  await mockDB(db);
});

const cases: TestStruct[] = [
  {
    title: "should create a new article without series and with new author",
    input: {
      title: "new blog",
      body: "new blog body",
      author: { name: "new author" },
    },
    expect: {
      title: "new blog",
      body: "new blog body",
      person: { name: "new author" },
    },
  },
  {
    title: "should create a new article with new series and with new author",
    input: {
      title: "new blog",
      body: "new blog body",
      author: { name: "new author" },
      chapter: { title: "new series", order: 1 },
    },
    expect: {
      title: "new blog",
      body: "new blog body",
      person: { name: "new author" },
      chapter: { order: 1 },
      series: { title: "new series" },
    },
  },
  {
    title:
      "should create a new article with new series and with existed author",
    input: {
      title: "new blog",
      body: "new blog body",
      author: {
        name: "John Doe",
      },
      chapter: { title: "Made-up Book", order: 2 },
    },
    expect: {
      title: "new blog",
      body: "new blog body",
      person: {
        name: "John Doe",
      },
      chapter: { order: 2 },
      series: { title: "Made-up Book" },
    },
  },
  {
    title: "should throw error if input's author not exist",
    input: {
      title: "new blog",
      body: "new blog body",
      author: undefined,
    },
    expect: {
      error: "创建文章失败",
    },
  },
];

const l = (result: Array<object>, expe: object) => {
  expect(result.length).toEqual(1);
  expect(result).toMatchObject([expe]);
};

const testCase = (c: TestStruct) => {
  test(c.title, async () => {
    const result = create(db)(c.input);

    if (c.expect.error) {
      expect(async () => {
        await result;
      }).toThrowError(c.expect.error);
    } else {
      expect(await result).toBeEmpty();
      // assert new blog and author is existed in db.
      const article = await findArticleByTitle(db)(c.input.title);
      l(article, { title: c.expect.title, body: c.expect.body });

      if (c.expect.person) {
        const person = await findPerson(db)(c.input.author.name);
        l(person, c.expect.person);

        const author = await findAuthor(db)(article[0].id);
        l(author, { article_id: article[0].id, person_id: person[0].id });
      }

      if (c.input.chapter && c.expect.series) {
        const series = await findSeries(db)(c.input.chapter.title);
        l(series, c.expect.series);

        const chapter = await findChapter(db)(article[0].id);
        l(chapter, {
          order: c.expect.chapter?.order,
          article_id: article[0].id,
          series_id: series[0].id,
        });
      }
    }
  });
};

cases.map(testCase);
