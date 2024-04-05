import { PageQueryDto } from "@src/modules/schema/pagination.schema";
import { Author } from "../domain/author.model";
import { PaginatedResponseDto } from "@src/modules/schema/paginated-query.response.schema";
import { AuthorEntity } from "../schema/author.schema";

export default interface AuthorRepository {
  list: (pagination: PageQueryDto) => Promise<PaginatedResponseDto<Author>>;
  getById: (id: number, pagination: PageQueryDto) => Promise<PaginatedResponseDto<AuthorEntity>>;
}
