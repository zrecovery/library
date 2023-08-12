import type { Article } from "../models/article.model";

export abstract class ArticlesRepositoryPort {
    abstract getList(limit?: number, offset?: number): Promise<Article[]>;
    abstract getByID(limit?: number, offset?: number): Promise<Article>;
    abstract create(article: Article): Promise<Article>;
    abstract delete(id: number): Promise<Article>;
    abstract search(keywords: string[], limit?: number, offset?: number): Promise<Article[]>
}


