import { Author } from "./author.model";

export interface BookEntity {
  id: number;
  title: string;
}

export interface AuthorEntity extends Author {
  id: number;
}

export interface AuthorCreated extends Author {}
