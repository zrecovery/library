import type { drizzle } from "drizzle-orm/bun-sqlite";
import type { ArticleDeletePort } from "./port/type/delete";
import { DeleteArticleUseCase } from "./delete.usecase";
import { ArticleDeleterRepository } from "./infrastructure/repository/deleter.repository";

export const DeleteArticleSerive =
  (client: ReturnType<typeof drizzle>) => async (port: ArticleDeletePort) => {
    return client.transaction(async (tx) => {
      const articleDeleter = new ArticleDeleterRepository(tx);
      const deleteArticleUseCase = new DeleteArticleUseCase(articleDeleter);
      return deleteArticleUseCase.execute(port);
    });
  };
