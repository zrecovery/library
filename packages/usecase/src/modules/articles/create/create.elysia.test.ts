import { createArticleHttpService } from "./create.elysia";
import { describe, expect, it } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { createArticleSerive } from "./create.service";
import { Database } from "bun:sqlite";
import { env } from "bun";
import { treaty } from "@elysiajs/eden";

const createDb = (): Database =>
  new Database(env.DATABASE_URI, { create: true });

const createSql = await Bun.file("./script/create.sql").text();

const db = createDb();
const client = drizzle(db);
db.run(createSql);
const articleService = await createArticleSerive(client);
const app = createArticleHttpService(articleService);
const api = treaty(app);

describe("Elysia", () => {
  it("returns an id", async () => {
    const { response, data } = await api.post(
      Object.freeze({
        title: "test",
        body: "测试内容",
        author: { name: "test author1" },
        chapter: { title: "系列1", order: 2.5 },
      }),
    );
    expect(response.status).toBe(200);
    expect(data).toBeNumber();
  });
});
