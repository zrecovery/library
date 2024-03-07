export interface Article {
  id: number;
  title: string;
  author: string;
  book: string;
  order: number;
  body: string;
  love: boolean;
  book_id?: number;
  author_id?: number;
}

export interface ArticleEntity {
  id: number;
  title: string;
  author: string;
  book: string;
  order: number;
  body: string;
  love: boolean;
  book_id: number;
  author_id: number;
}