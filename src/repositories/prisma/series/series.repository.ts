import { PrismaClient } from "@prisma/client";
import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Series } from "@src/model";
import { SeriesRepository } from "@src/repositories/series.repository.port";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";

export class SeriesPrismaRepository implements SeriesRepository {
    #client: PrismaClient

    constructor(private readonly client: PrismaClient) {
        this.#client = client
    }


    getById(id: number): Promise<Required<Series>> {
        return this.#client.series.findFirstOrThrow({ where: { id } })
    }

    create(created: Creatable<Series>): Promise<Required<Series>> {
        return this.#client.series.create({ data: created })
    }
    update(id: number, updated: Partial<Series>): Promise<Required<Series>> {
        return this.#client.series.update({ where: { id }, data: updated })
    }
    delete = async (id: number): Promise<void> => {
        await this.#client.series.delete({ where: { id } })
    }

    list = async (query: Query): Promise<PaginatedResponse<Required<Series>[]>> => {
        const { page, size } = query;
        const { limit, offset } = paginationToOffsetLimit({ page, size });

        const canQueryKey = ["title"];
        const where = canQueryKey.reduce((prev, key) => query[key] ? { ...prev, [key]: query[key] } : prev, {});

        const count = await this.#client.series.count({
            where: where
        });

        const series = await this.#client.series.findMany({
            where: where,
            skip: offset,
            take: limit,
        });

        return {
            detail: series,
            pagination: {
                pages: Math.ceil(count / (size ?? 10)),
                items: count,
                current: page ?? 1,
                size: size ?? 10
            }
        }
    }
}