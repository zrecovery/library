import { PrismaClient } from "@prisma/client";
import { AuthorCreated, AuthorEntity } from "@src/core/author/author.schema";
import { BookCreated, BookEntity } from "@src/core/book/book.schema";
import { articleEntitySelect, queryArticle } from "./article.repository.util;

// BasePrismaRepository 提供基本的CRUD操作封装。
export class BasePrismaRepository {
  #client: PrismaClient;

  constructor(client: PrismaClient) {
    this.#client = client;
  }

  getArticleById = async (id: number): Promise<queryArticle | null> => {
    return this.#client.article.findFirstOrThrow({
      select: articleEntitySelect,
      where: { id },
    });
  };

  createAuthor = async (author: AuthorCreated): Promise<AuthorEntity> => {
    return this.#client.author.create({
      data: {
        name: author.name,
      },
    });
  };

  findAuthorByName = async (name: string) => {
    return this.#client.author.findFirst({
      where: { name },
    });
  };

  findAuthorById = async (id: number) => {
    return this.#client.author.findFirst({
      where: { id },
    });
  };

  findAuthorOrCreate = async (name: string): Promise<AuthorEntity> => {
    const author = await this.findAuthorByName(name);
    if (author) {
      return author;
    } else {
      return this.createAuthor({ name });
    }
  };

  findBookByTitle = async (title: string, author_id: number) => {
    return this.#client.book.findFirst({
      where: { title, author_id },
    });
  };

  createBook = async (book: BookCreated) => {
    return this.#client.book.create({
      data: {
        title: book.title,
        author_id: book.author_id,
      },
    });
  };

  findBookOrCreate = async (
    title: string,
    author_id: number,
  ): Promise<BookEntity> => {
    const book = await this.findBookByTitle(title, author_id);
    if (book) {
      return book;
    } else {
      return this.createBook({ title, author_id });
    }
  };

  deleteBook = async (id: number) => {
    return this.#client.book.delete({ where: { id } });
  };

  createChapter = async (chapter: {
    book_id: number;
    article_id: number;
    order: number;
  }) => {
    return this.#client.chapter.create({
      data: {
        book_id: chapter.book_id,
        article_id: chapter.article_id,
        chapter_order: chapter.order,
      },
    });
  };
}
