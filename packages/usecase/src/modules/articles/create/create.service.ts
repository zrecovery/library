import { CreateArticleUseCase } from "./create-article.usecase";
import { drizzle } from "drizzle-orm/bun-sqlite";
import type { ArticleCreatePort } from "./port/type/create";
import {
  ChapterSaverRepository,
  ArticleSaverRepository,
  AuthorSaverRepository,
  SearchHandlerRepository,
} from "./infrastructure/repository";

export const createArticleSerive =
  (client: ReturnType<typeof drizzle>) => async (port: ArticleCreatePort) => {
    return client.transaction(async (tx) => {
      const articleSaver = new ArticleSaverRepository(tx);
      const chapterSaver = new ChapterSaverRepository(tx);
      const authorSaver = new AuthorSaverRepository(tx);
      const keywordSaver = new SearchHandlerRepository(tx);
      const createArticleUseCase = new CreateArticleUseCase(
        articleSaver,
        authorSaver,
        chapterSaver,
        keywordSaver,
      );
      return createArticleUseCase.execute(port);
    });
  };
