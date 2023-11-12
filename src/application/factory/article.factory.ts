import { ArticleService } from "@/core/article/article.service";
import { ArticleController } from "@/infrastructure/controllers/article.controller";
import { ArticlePrismaRepository } from "@/infrastructure/prisma/articles.repository";
import { PrismaClient } from "@prisma/client";

export const articleFactory = (client: PrismaClient) =>
  new ArticleController(
    new ArticleService(new ArticlePrismaRepository(client)),
  );
