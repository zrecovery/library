import { type Author } from "./model/author.model";
import type AuthorRepository from "./repository/AuthorRepository";

export class AuthorService {
  constructor(readonly authorRepository: AuthorRepository) {}
  public list = async (limit: number, offset: number): Promise<Author[]> => {
    return await this.authorRepository.getList(limit, offset);
  };
}
