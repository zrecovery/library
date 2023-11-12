import { ArticleService } from "@/core/article/article.service";
import { ArticleController } from "@/infrastructure/controllers/article.controller";
import { ArticlePrismaRepository } from "@/infrastructure/prisma/articles.repository";
import { PrismaClient } from "@prisma/client";

export const articleFactory = (client: PrismaClient) => {
    const articleRepository = new ArticlePrismaRepository(client);
    const articleService = new ArticleService(articleRepository);
    return new ArticleController(articleService);
  }
  