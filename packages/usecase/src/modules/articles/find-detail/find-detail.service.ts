import type { drizzle } from "drizzle-orm/bun-sqlite";
import { FindArticleDetailUseCase } from "./find-detail.usecase";
import { ArticleDetailFinderRepository } from "./infrastructure/repository";

export const createArticleDetailSerive = (
  client: ReturnType<typeof drizzle>,
) => {
  return client.transaction(async (tx) => {
    const articleDetailFinderRepository = new ArticleDetailFinderRepository(tx);
    return new FindArticleDetailUseCase(articleDetailFinderRepository);
  });
};
