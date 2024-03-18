import { Article } from "./article.model";

export interface ArticleCreated extends Article {}

export interface ArticleUpdated extends Article {
  id: number;
  book_id: number;
  author_id: number;
}

export interface ArticleEntity extends Article {
  id: number;
  book_id: number;
  author_id: number;
}
