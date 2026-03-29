import {
  CreateArticleUseCase,
  type ArticleCreatePort,
} from "@library/usecase/articles/create";
import { ArticleSaverRepository } from "@library/infrastructure/repository/articles";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { ChapterSaverRepository } from "@library/infrastructure/repository/chapters";
import { AuthorSaverRepository } from "@library/infrastructure/repository/authors";
import { KeywordHandlerRepository } from "../../infrastructure/src/modules/repository/search/keyword-handler.repository";

export const createArticleSerive = (client: ReturnType<typeof drizzle>) => async (port: ArticleCreatePort) => {
  return client.transaction(async (tx) => {
    const articleSaver = new ArticleSaverRepository(tx);
    const chapterSaver = new ChapterSaverRepository(tx);
    const authorSaver = new AuthorSaverRepository(tx);
    const keywordSaver = new KeywordHandlerRepository(tx);
    const createArticleUseCase = new CreateArticleUseCase(
      articleSaver,
      authorSaver,
      chapterSaver,
      keywordSaver,
    );
    return createArticleUseCase.execute(port);
  });
};
