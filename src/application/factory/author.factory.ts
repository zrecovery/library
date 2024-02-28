import { AuthorService } from "@src/core/author/author.service";
import { AuthorController } from "@src/infrastructure/controllers/author.controller";
import { AuthorPrismaRepository } from "@src/infrastructure/prisma/author.repository";
import { PrismaClient } from "@prisma/client";

export const AuthorFactory = (client: PrismaClient) => {
  const authorRepository = new AuthorPrismaRepository(client);
  const authorService = new AuthorService(authorRepository);
  return new AuthorController(authorService);
};
