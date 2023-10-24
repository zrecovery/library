import { Article } from "@app/models/article.model";
import type { Author } from "@app/models/author.model";
import { Book } from "@app/models/book.model";

export abstract class AuthorsRepositoryPort {
    abstract getList(limit?: number, offset?: number): Promise<Author[]>;
    abstract getBooksById(id: number, limit?: number, offset?: number): Promise<Book[]>;
    abstract getArticlesById(id: number, limit?: number, offset?: number): Promise<Article[]>;
}


