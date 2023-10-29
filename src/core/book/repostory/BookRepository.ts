import type { Book } from "../model/book.model";

export default abstract class BookRepository {
    abstract getList(limit: number, offset: number): Promise<Book[]>;
    abstract getBookById(id: number, limit: number, offset: number): Promise<Book>;
    abstract getBooksByAuthorId(authorId: number, limit: number, offset: number): Promise<Book[]>;
}
