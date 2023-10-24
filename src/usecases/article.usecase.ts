import type { Article } from "../models/article.model";

export interface Query {
    love?: boolean;
    keywords?: string;
}

export abstract class ArticlesRepositoryPort {
    abstract getList(query: Query, limit?: number, offset?: number): Promise<Article[]>;
    abstract getByID(limit?: number, offset?: number): Promise<Article>;
    abstract create(article: Article): Promise<number>;
    abstract delete(id: number): Promise<void>;
    abstract search(keywords: string[], limit?: number, offset?: number): Promise<Article[]>
}


