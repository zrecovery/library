import { PageQueryDto } from "@src/modules/schema/pagination.schema";
import { ArticleCreatedProps, ArticlePaginatedResponse, ArticleResponse, ArticleUpdatedProps } from "../schema/article.schema";

export interface Query {
  love?: boolean;
  keyword?: string;
}

export abstract class ArticleRepository {
  abstract getById(id: number): Promise<ArticleResponse>;
  abstract create(article: ArticleCreatedProps): Promise<void>;
  abstract update(article: ArticleUpdatedProps): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract search(
    query: Query,
    pagination: PageQueryDto,
  ): Promise<ArticlePaginatedResponse>;
}
