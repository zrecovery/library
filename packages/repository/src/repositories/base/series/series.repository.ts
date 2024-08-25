import type { PrismaClient } from "@prisma/client";
import type { Series } from "model/domain";
import type { Creatable } from "model/protocol";
import type { PaginatedResponse, Query } from "model/schema";
import { convertPageToOffset, convertPaginationDetail } from "pagination";
import type { SeriesBaseRepository } from "src/repositories/bussiness/base.port";

export class SeriesBasePrismaRepository implements SeriesBaseRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}
	update = (id: number, data: Partial<Series>): Promise<Required<Series>> =>
		this.#client.series.update({ where: { id }, data });

	remove = async (id: number): Promise<void> => {
		await this.#client.series.delete({ where: { id } });
	};

	findMany = async (
		query?: Query,
	): Promise<PaginatedResponse<Required<Series>[]>> => {
		const { page, size } = query || {};

		const count = await this.#client.series.count({
			select: { id: true },
		});

		const { limit, offset } = convertPageToOffset({ page, size });
		const data = await this.#client.series.findMany({
			take: limit,
			skip: offset,
		});

		return {
			detail: data,
			pagination: convertPaginationDetail(count.id, {
				limit: limit ?? 10,
				offset: offset ?? 0,
			}),
		};
	};

	find = async (query: {
		title?: string;
		id?: number;
	}): Promise<Required<Series> | null> =>
		this.#client.series.findFirst({ where: query });

	create = async (data: Creatable<Series>) =>
		this.#client.series.create({ data });
}
