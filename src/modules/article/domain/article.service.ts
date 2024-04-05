import { PageQueryDto } from "@modules/schema/pagination.schema";
import { ArticleCreatedProps, ArticlePaginatedResponse, ArticleResponse, ArticleUpdatedProps } from "../schema/article.schema";
import { ArticleRepository, Query } from "../repository/article.repository";

export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) { }

  async create(article: ArticleCreatedProps): Promise<void> {
    return this.articleRepository.create(article);
  }

  async findById(id: number): Promise<ArticleResponse> {
    return this.articleRepository.getById(id);
  }

  async findList(
    query: Query,
    pagination: PageQueryDto,
  ): Promise<ArticlePaginatedResponse> {
    return this.articleRepository.search(query, pagination);
  }

  async update(article: ArticleUpdatedProps): Promise<void> {
    return this.articleRepository.update(article);
  }

  async delete(id: number): Promise<void> {
    return this.articleRepository.delete(id);
  }
}
