import type { PrismaClient } from "@prisma/client";
import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Series } from "@src/model";
import type { SeriesRepository } from "@src/repositories/series.repository.port";
export declare class SeriesPrismaRepository implements SeriesRepository {
    #private;
    private readonly client;
    constructor(client: PrismaClient);
    getById(id: number): Promise<Required<Series>>;
    create(created: Creatable<Series>): Promise<Required<Series>>;
    update(id: number, updated: Partial<Series>): Promise<Required<Series>>;
    delete: (id: number) => Promise<void>;
    list: (query: Query) => Promise<PaginatedResponse<Required<Series>[]>>;
}
