import { type PrismaClient } from "@prisma/client";
import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { ArticleAuthorRelationship } from "@src/model";
import type { ArticleAuthorRelationshipRepository } from "@src/repositories/author.repository.port";
export declare class ArticlesAuthorsRelationPrismaRepository implements ArticleAuthorRelationshipRepository {
    #private;
    constructor(client: PrismaClient);
    getById(id: number): Promise<Required<ArticleAuthorRelationship>>;
    create(created: Creatable<ArticleAuthorRelationship>): Promise<Required<ArticleAuthorRelationship>>;
    update(id: number, updated: Partial<ArticleAuthorRelationship>): Promise<Required<ArticleAuthorRelationship>>;
    delete: (id: number) => Promise<void>;
    list: (query: Query) => Promise<PaginatedResponse<Required<ArticleAuthorRelationship>[]>>;
}
