import { ArticleService } from "@src/core/article/article.service";
import { ArticleController } from "@src/infrastructure/controllers/article.controller";
import { ArticlePrismaRepository } from "@src/infrastructure/prisma/article.repository";
import { PrismaClient } from "@prisma/client";

export const articleFactory = (client: PrismaClient) =>
  new ArticleController(
    new ArticleService(new ArticlePrismaRepository(client)),
  );
