import type { PrismaClient } from "@prisma/client";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Chapter, Creatable, Query, Updatable } from "@src/model";
import type { ChapterRepository } from "@src/domain/base.repository.port";
import { convertPageToOffset } from "@src/utils/pagination.util";
import { convertPaginationDetail } from "@src/utils/convertPaginationDetail";

export class ChapterBasePrismaRepository implements ChapterRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}

	delete = async (id: number): Promise<void> => {
		await this.#client.chapter.delete({ where: { id } });
	};

	findMany = async (
		query?: Query,
	): Promise<PaginatedResponse<Required<Chapter>[]>> => {
		const { page, size } = query || {};
		const count = await this.#client.chapter.count({ select: { id: true } });
		const { limit, offset } = convertPageToOffset({ page, size });
		const data = await this.#client.chapter.findMany({
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

	create = async (data: Creatable<Chapter>) =>
		this.#client.chapter.create({ data });

	find = async (query: { id?: number }): Promise<Required<Chapter> | null> =>
		this.#client.chapter.findFirst({ where: query });

	update = async (id: number, data: Updatable<Chapter>) =>
		this.#client.chapter.update({ data, where: { id } });
}
