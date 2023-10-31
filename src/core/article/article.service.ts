import type { Article } from "./model/article.model";
import type { ArticleRepository, Query } from "./repository/ArticleRepository";

export default class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async create(article: Article): Promise<void> {
    await this.articleRepository.createArticle(article);
  }

  async getById(id: number): Promise<Article> {
    return await this.articleRepository.getArticleById(id);
  }

  async getByAuthorId(
    authorId: number,
    limit: number,
    offset: number,
  ): Promise<Article[]> {
    return await this.articleRepository.getArticlesByAuthorId(
      authorId,
      limit,
      offset,
    );
  }

  async getList(
    query: Query,
    limit: number,
    offset: number,
  ): Promise<Article[]> {
    return await this.articleRepository.searchArticles(query, limit, offset);
  }

  async update(article: Article): Promise<void> {
    await this.articleRepository.updateArticle(article);
  }

  async delete(id: number): Promise<void> {
    await this.articleRepository.deleteArticle(id);
  }
}
