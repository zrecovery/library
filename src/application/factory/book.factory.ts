import BookService from "@src/core/book/book.service";
import { BookController } from "@src/infrastructure/controllers/book.contoller";
import { BookPrismaRepository } from "@src/infrastructure/prisma/book.repository";
import { PrismaClient } from "@prisma/client";

export const bookFactory = (client: PrismaClient) => {
  const bookRepository = new BookPrismaRepository(client);
  const bookService = new BookService(bookRepository);
  return new BookController(bookService);
};
