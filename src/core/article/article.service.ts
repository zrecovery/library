import { Pagination } from "../schema/pagination.schema";
import { QueryResult } from "../schema/query-result.schema";
import type { Article } from "./article.model";
import type { ArticleRepository, Query } from "./article.repository";

export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) { }

  async create(article: Article): Promise<void> {
    return this.articleRepository.create(article);
  }

  async findById(id: number): Promise<QueryResult<Article>> {
    return this.articleRepository.getById(id);
  }

  async findList(
    query: Query,
    pagination: Pagination
  ): Promise<QueryResult<Article[]>> {
    return this.articleRepository.search(query, pagination);
  }

  async update(article: Article): Promise<void> {
    return this.articleRepository.update(article);
  }

  async delete(id: number): Promise<void> {
    return this.articleRepository.delete(id);
  }
}
