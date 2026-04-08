import type { drizzle } from "drizzle-orm/bun-sqlite";
import { ArticleListRepository } from "./infrastructure/repository/article-list.repository";
import { FindArticleListUseCase } from "./list.usecase";
import { SearchRepository } from "./infrastructure/repository/searcher";

export const createArticleListSerive = (client: ReturnType<typeof drizzle>) => {
  return client.transaction(async (tx) => {
    const articleListRepository = new ArticleListRepository(tx);
    const queryKeywordHandler = new SearchRepository(tx);
    const articleListUseCase = new FindArticleListUseCase(
      articleListRepository,
      queryKeywordHandler,
    );
    return articleListUseCase;
  });
};
