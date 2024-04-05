import { Book } from "../domain/book.model";

export interface ArticleEntity {
  id: number;
  title: string;
  order: number;
  body: string;
  author: string;
  author_id: number;
}

export interface BookEntity extends Book {
  articles: ArticleEntity[];
}

