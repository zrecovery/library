import type { PrismaClient } from "@prisma/client";
import type { AuthorRepository } from "domain/repository.port";
import type { Author } from "model/domain";
import type { Creatable } from "model/protocol";
import type { PaginatedResponse, Query } from "model/schema";
import { convertPageToOffset, convertPaginationDetail } from "pagination";

export class AuthorBasePrismaRepository implements AuthorRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}
	update = (id: number, data: Partial<Author>): Promise<Required<Author>> =>
		this.#client.author.update({ where: { id }, data });

	delete = async (id: number): Promise<void> => {
		await this.#client.author.delete({ where: { id } });
	};

	findMany = async (
		query?: Query,
	): Promise<PaginatedResponse<Required<Author>[]>> => {
		const { page, size } = query || {};
		const count = await this.#client.author.count({
			select: { id: true },
		});
		const { limit, offset } = convertPageToOffset({ page, size });
		const data = await this.#client.author.findMany({
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
		article_id?: number;
		author_id?: number;
	}): Promise<Required<Author> | null> =>
		this.#client.author.findFirst({ where: query });

	create = async (data: Creatable<Author>) =>
		this.#client.author.create({ data });
}
