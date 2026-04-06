import Elysia from "elysia";
import { createArticleHttpService } from "./create";
import { createArticleSerive } from "./create/create.service";
import type { drizzle } from "drizzle-orm/bun-sqlite";

export const articleHttpService = async (db: ReturnType<typeof drizzle>) => {
  const articleCreate = await createArticleSerive(db);
  const create = createArticleHttpService(articleCreate);
  return new Elysia({ prefix: "/articles" }).use(create);
};
