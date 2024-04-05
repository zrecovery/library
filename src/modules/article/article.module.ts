import { ArticleService } from "./domain/article.service";
import { PrismaClient } from "@prisma/client";
import { articleRestController } from "./controller/article.controller";
import { ArticlePrismaRepository } from "./repository/article.prisma.repository";


export const articleModule = () => {
  const client = new PrismaClient();
  const articleRepository = new ArticlePrismaRepository(client);
  const articleService = new ArticleService(articleRepository);
  const articleController = articleRestController(articleService);
  return articleController;
}
