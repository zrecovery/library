import { Pagination } from "../schema/pagination.schema";
import { QueryResult } from "../schema/query-result.schema";
import type { Article } from "./article.model";
import type { ArticleRepository, Query } from "./article.repository";
import {
  ArticleCreated,
  ArticleEntity,
  ArticleUpdated,
} from "./article.schema";

export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async create(article: ArticleCreated): Promise<void> {
    return this.articleRepository.create(article);
  }

  async findById(id: number): Promise<QueryResult<ArticleEntity>> {
    return this.articleRepository.getById(id);
  }

  async findList(
    query: Query,
    pagination: Pagination,
  ): Promise<QueryResult<ArticleEntity[]>> {
    return this.articleRepository.search(query, pagination);
  }

  async update(article: ArticleUpdated): Promise<void> {
    return this.articleRepository.update(article);
  }

  async delete(id: number): Promise<void> {
    return this.articleRepository.delete(id);
  }
}
