import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Author } from "@src/model";
import { AuthorRepository } from "../author.repository.port";

export class AuthorMockRepository implements AuthorRepository {
    getByName(author: Creatable<Author>): Promise<Author> {
        throw new Error("Method not implemented.");
    }
    getById(id: number, query?: Record<string, string | number | string[] | undefined> | undefined): Promise<Required<Author>> {
        throw new Error("Method not implemented.");
    }
    create(created: Creatable<Author>): Promise<Author> {
        throw new Error("Method not implemented.");
    }
    update(id: number, updated: Partial<Author>): Promise<Required<Author>> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    list(query?: Query | undefined): Promise<PaginatedResponse<Required<Author>[]>> {
        throw new Error("Method not implemented.");
    }
}