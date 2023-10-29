import type AuthorRepository from "./repository/AuthorRepository";

export class AuthorService {
    constructor(readonly authorRepository: AuthorRepository) { }
    public list = async (limit: number, offset: number) => {
        return await this.authorRepository.getList(limit, offset);
    };
}