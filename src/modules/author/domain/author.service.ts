import { PageQueryDto } from "@src/modules/schema/pagination.schema";
import AuthorRepository from "../repository/author.repository";
import { AuthorEntity } from "../schema/author.schema";
import { type Author } from "./author.model";
import { PaginatedResponseDto } from "@src/modules/schema/paginated-query.response.schema";

export class AuthorService {
  constructor(readonly authorRepository: AuthorRepository) { }
  public list = async (
    pagination: PageQueryDto,
  ): Promise<PaginatedResponseDto<Author[]>> => {
    return this.authorRepository.list(pagination);
  };

  public getById = async (
    id: number,
    pagination: PageQueryDto,
  ): Promise<PaginatedResponseDto<AuthorEntity>> => {
    return this.authorRepository.getById(id, pagination);
  };
}
