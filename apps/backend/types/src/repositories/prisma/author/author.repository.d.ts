import type { PrismaClient } from "@prisma/client";
import type { Creatable, Updatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Author } from "@src/model";
import type { AuthorRepository } from "@src/repositories/author.repository.port";
export declare class AuthorPrismaRepository implements AuthorRepository {
    #private;
    constructor(client: PrismaClient);
    getById(id: number): Promise<Required<Author>>;
    create(created: Creatable<Author>): Promise<Required<Author>>;
    update(id: number, updated: Updatable<Author>): Promise<Required<Author>>;
    delete(id: number): Promise<void>;
    list(query: Query): Promise<PaginatedResponse<Required<Author>[]>>;
}
