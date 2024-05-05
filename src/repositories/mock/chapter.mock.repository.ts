import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Chapter } from "@src/model";
import { ChapterRepository } from "../series.repository.port";

export class ChapterMockRepository implements ChapterRepository {
    getById(id: number, query?: Record<string, string | number | string[] | undefined> | undefined): Promise<Required<Chapter>> {
        throw new Error("Method not implemented.");
    }
    create(created: Creatable<Chapter>): Promise<Required<Chapter>> {
        throw new Error("Method not implemented.");
    }
    update(id: number, updated: Partial<Chapter>): Promise<Required<Chapter>> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    list(query?: Query | undefined): Promise<PaginatedResponse<Required<Chapter>[]>> {
        throw new Error("Method not implemented.");
    }
}