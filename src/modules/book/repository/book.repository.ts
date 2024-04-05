import { PaginatedResponseDto } from "@src/modules/schema/paginated-query.response.schema";
import { PageQueryDto } from "@src/modules/schema/pagination.schema";
import { Book } from "../domain/book.model";
import { BookEntity } from "../schema/book.schema";

export default abstract class BookRepository {
  abstract list(pagination: PageQueryDto): Promise<PaginatedResponseDto<Book[]>>;
  abstract getById(
    id: number,
    pagination: PageQueryDto,
  ): Promise<PaginatedResponseDto<BookEntity>>;
  abstract getBooksByAuthorId(authorId: number, pagination: PageQueryDto): Promise<PaginatedResponseDto<Book[]>>;
}
