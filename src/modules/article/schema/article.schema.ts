import { PaginatedResponseDto } from "@src/modules/schema/query-result.schema";
import { Article } from "../domain/article.model";

export interface ArticleCreatedProps {
  title: string;
  author: string;
  book: string;
  order: number;
  body: string;
  love: boolean;
}

export interface ArticleUpdatedProps {
  id: number;
  title?: string;
  author?: string;
  book?: string;
  order?: number;
  body?: string;
  love?: boolean;
  book_id?: number;
  author_id?: number;
}

export interface ArticleResponse extends Article {
  book_id: number;
  author_id: number;
}

export interface ArticlePaginatedResponse extends PaginatedResponseDto<ArticleResponse> {

}
