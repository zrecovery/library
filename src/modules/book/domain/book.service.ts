import { PaginatedResponseDto } from "@src/modules/schema/paginated-query.response.schema";
import BookRepository from "../repository/book.repository";
import type { Book } from "./book.model";
import { PageQueryDto } from "@src/modules/schema/pagination.schema";
import { BookEntity } from "../schema/book.schema";

export default class BookService {
  constructor(private readonly bookRepository: BookRepository) { }

  async getList(pagination: PageQueryDto): Promise<PaginatedResponseDto<Book[]>> {
    return this.bookRepository.list(pagination);
  }

  async getBookById(
    id: number,
    pagination: PageQueryDto
  ): Promise<PaginatedResponseDto<BookEntity>> {
    return this.bookRepository.getById(id, pagination);
  }

}
