import type { PrismaClient } from "@prisma/client";
import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Chapter } from "@src/model";
import type { ChapterRepository } from "@src/repositories/series.repository.port";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";

export class ChapterPrismaRepository implements ChapterRepository {
	#client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}

	getById(id: number): Promise<Required<Chapter>> {
		return this.#client.chapter.findFirstOrThrow({ where: { id } });
	}

	create(created: Creatable<Chapter>): Promise<Required<Chapter>> {
		return this.#client.chapter.create({ data: created });
	}

	update(id: number, updated: Partial<Chapter>): Promise<Required<Chapter>> {
		return this.#client.chapter.update({ where: { id }, data: updated });
	}

	delete = async (id: number): Promise<void> => {
		await this.#client.chapter.delete({ where: { id } });
	};

	list = async (
		query: Query,
	): Promise<PaginatedResponse<Required<Chapter>[]>> => {
		const { page, size } = query;
		const { limit, offset } = paginationToOffsetLimit({ page, size });

		const canQueryKey = ["article_id", "series_id"];
		const where = canQueryKey.reduce(
			(
				prev: { [key: string]: string | number | string[] | undefined },
				key: string,
			) => {
				if (query[key]) {
					prev[key] = query[key];
				}
				return prev;
			},
			{},
		);

		const count = await this.#client.chapter.count({
			where: where,
		});

		const chapters = await this.#client.chapter.findMany({
			where: where,
			skip: offset,
			take: limit,
		});

		return {
			detail: chapters,
			pagination: {
				pages: Math.ceil(count / (size ?? 10)),
				items: count,
				current: page ?? 1,
				size: size ?? 10,
			},
		};
	};
}
