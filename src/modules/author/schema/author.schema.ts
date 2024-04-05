import { Author } from "../domain/author.model";

export interface BookEntity {
  id: number;
  title: string;
}

export interface AuthorEntity extends Author {
  books: BookEntity[];
}
