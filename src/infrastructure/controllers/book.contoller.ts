import type BookService from "@/core/book/book.service";
import type { Context } from "elysia";

export class BookController {
    constructor(readonly bookService: BookService) {

    }

    public list = async ({ query }: Context) => {
        const { page, size } = query;
        const limit = size !== undefined ? Number(size) : 10;
        const count = page !== undefined ? Number(page) : 1;
        const offset = count * limit;
        return await this.bookService.getList(limit, offset);
    };

    public getById = async ({ query, params: { id } }: Context) => {
        const { page, size } = query;
        const limit = size !== undefined ? Number(size) : 10;
        const count = page !== undefined ? Number(page) : 1;
        const offset = count * limit;
        return await this.bookService.getBookById(Number(id), limit, offset);
    };

    public getByAuthorId = async ({ query, params: { id } }: Context) => {
        const { page, size } = query;
        const limit = size !== undefined ? Number(size) : 10;
        const count = page !== undefined ? Number(page) : 1;
        const offset = count * limit;
        return await this.bookService.getBooksByAuthorId(Number(id), limit, offset);
    };

}