import { Book } from "./book.model";

export interface BookEntity extends Book {
  id: number;
  author_id: number;
}

export interface BookCreated extends Book {
  author_id: number;
}
