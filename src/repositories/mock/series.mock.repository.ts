import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Series } from "@src/model";
import { SeriesRepository } from "../series.repository.port";

export class SeriesMockRepository implements SeriesRepository {
    getByTitle(series: Creatable<Series>): Promise<Series> {
        throw new Error("Method not implemented.");
    }
    getById(id: number, query?: Record<string, string | number | string[] | undefined> | undefined): Promise<Required<Series>> {
        throw new Error("Method not implemented.");
    }
    create(created: Creatable<Series>): Promise<Series> {
        throw new Error("Method not implemented.");
    }
    update(id: number, updated: Partial<Series>): Promise<Required<Series>> {
        throw new Error("Method not implemented.");
    }
    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    list(query?: Query | undefined): Promise<PaginatedResponse<Required<Series>[]>> {
        throw new Error("Method not implemented.");
    }
}