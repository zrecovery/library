import Elysia from "elysia";
import { createArticleHttpService } from "./create";
import { createArticleSerive } from "./create/create.service";
import type { drizzle } from "drizzle-orm/bun-sqlite";
import { createArticleListHttpService } from "./find-list";
import { createArticleListSerive } from "./find-list/list.service";
import { createArticleDetailSerive } from "./find-detail/find-detail.service";
import { createArticleDetailHttpService } from "./find-detail/find-detail.elysia";

export const articleHttpService = async (db: ReturnType<typeof drizzle>) => {
  const articleCreate = await createArticleSerive(db);
  const create = createArticleHttpService(articleCreate);
  const articleList = await createArticleListSerive(db);
  const list = createArticleListHttpService(articleList);
  const articleDetail = await createArticleDetailSerive(db);
  const detail = createArticleDetailHttpService(articleDetail);
  return new Elysia({ prefix: "/articles" }).use(create).use(list).use(detail);
};
