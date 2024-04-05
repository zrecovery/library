import { Author } from "@src/modules/author/author.model";
import { Book } from "@src/modules/book/book.model";

export interface Chapter {
  book: Book;
  order: number;
}

export interface Article {
  id?: number;
  title: string;
  author: Author;
  chapter: Chapter;
  body: string;
  love: boolean;
}
