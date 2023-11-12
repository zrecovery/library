import BookService from "@/core/book/book.service";
import { BookController } from "@/infrastructure/controllers/book.contoller";
import { BookPrismaRepository } from "@/infrastructure/prisma/books.repository";
import { PrismaClient } from "@prisma/client";

export const bookFactory = (client: PrismaClient) => {
  const bookRepository = new BookPrismaRepository(client);
  const bookService = new BookService(bookRepository);
  return new BookController(bookService);
};
