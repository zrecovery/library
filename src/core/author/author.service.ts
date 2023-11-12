import { type Author } from "./author.model";
import type AuthorRepository from "./author.repository";

export class AuthorService {
  constructor(readonly authorRepository: AuthorRepository) {}
  public list = async (limit: number, offset: number): Promise<Author[]> => {
    return await this.authorRepository.getList(limit, offset);
  };
}
