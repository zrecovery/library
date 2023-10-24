import type { Book } from "../models/book.model";

export abstract class BooksRepositoryPort {
    abstract getList(limit?: number, offset?: number): Promise<Book[]>;
    abstract getById(id: number, limit?: number, offset?: number): Promise<Book[]>;
}


