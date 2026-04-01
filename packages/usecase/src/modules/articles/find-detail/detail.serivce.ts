import {
  FindArticleDetailUseCase,
  type ArticleDetailPort,
} from "@library/usecase/articles/find-detail";
import type { drizzle } from "drizzle-orm/bun-sqlite";
import { ArticleDetailFinderRepository } from "./infrastructure/repository";

export const DetailArticleSerive =
  (client: ReturnType<typeof drizzle>) => async (port: ArticleDetailPort) => {
    return client.transaction(async (tx) => {
      const articleDetailFinder = new ArticleDetailFinderRepository(tx);
      const findArticleDetailUseCase = new FindArticleDetailUseCase(
        articleDetailFinder,
      );
      return findArticleDetailUseCase.execute(port);
    });
  };
