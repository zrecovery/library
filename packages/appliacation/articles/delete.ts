import {
  DeleteArticleUseCase,
  type ArticleDeletePort,
} from "@library/usecase/articles/delete";
import { ArticleDeleterRepository } from "@library/infrastructure/repository/articles";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { ChapterDeleterRepository } from "@library/infrastructure/repository/chapters";
import { AuthorDeleterRepository } from "@library/infrastructure/repository/authors";
import { SearchDeleterRepository } from "@library/infrastructure/repository/search";

const client = drizzle();
export const DeleteArticleSerive = async (port: ArticleDeletePort) => {
  return client.transaction(async (tx) => {
    const articleDeleter = new ArticleDeleterRepository(tx);
    const chapterDeleter = new ChapterDeleterRepository(tx);
    const authorDeleter = new AuthorDeleterRepository(tx);
    const keywordDeleter = new SearchDeleterRepository(tx);
    const deleteArticleUseCase = new DeleteArticleUseCase(
      articleDeleter,
      authorDeleter,
      chapterDeleter,
      keywordDeleter,
    );
    return deleteArticleUseCase.execute(port);
  });
};
