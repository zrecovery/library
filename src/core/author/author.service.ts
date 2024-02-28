import { AuthorEntity } from "../schema/author.schema";
import { Pagination } from "../schema/pagination.schema";
import { QueryResult } from "../schema/query-result.schema";
import { type Author } from "./author.model";
import type AuthorRepository from "./author.repository";

export class AuthorService {
  constructor(readonly authorRepository: AuthorRepository) { }
  public list = async (pagination: Pagination): Promise<QueryResult<Author[]>> => {
    return this.authorRepository.list(pagination);
  };

  public getById = async (id: number, pagination: Pagination): Promise<QueryResult<AuthorEntity>> => {
    return this.authorRepository.getById(id, pagination);
  }
}
