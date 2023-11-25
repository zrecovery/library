import { QueryResult } from "../query-result.model";
import type { Article } from "./article.model";
import type { ArticleRepository, Query } from "./article.repository";

export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async create(article: Article): Promise<void> {
    return this.articleRepository.createArticle(article);
  }

  async getById(id: number): Promise<Article> {
    return this.articleRepository.getArticleById(id);
  }

  async getByAuthorId(
    authorId: number,
    limit: number,
    offset: number,
  ): Promise<Article[]> {
    return this.articleRepository.getArticlesByAuthorId(
      authorId,
      limit,
      offset,
    );
  }

  async getList(
    query: Query,
    limit: number,
    offset: number,
  ): Promise<QueryResult<Article[]>> {
    return this.articleRepository.searchArticles(query, limit, offset);
  }

  async update(article: Article): Promise<void> {
    return this.articleRepository.updateArticle(article);
  }

  async delete(id: number): Promise<void> {
    return this.articleRepository.deleteArticle(id);
  }
}
