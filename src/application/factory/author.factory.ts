import { AuthorService } from "@/core/author/author.service";
import { AuthorController } from "@/infrastructure/controllers/author.controller";
import { AuthorPrismaRepository } from "@/infrastructure/prisma/author.repository";
import { PrismaClient } from "@prisma/client";

export const AuthorFactory = (client: PrismaClient) => {
  const authorRepository = new AuthorPrismaRepository(client);
  const authorService = new AuthorService(authorRepository);
  return new AuthorController(authorService);
};
