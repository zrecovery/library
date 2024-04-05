import { Author } from "@src/modules/author/domain/author.model";

export interface Book {
  id?: number;
  title: string;
  author?: Author;
}
