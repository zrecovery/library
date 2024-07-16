import type { PrismaClient } from "@prisma/client";
import type { Creatable, Updatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Author } from "@src/model";
import type { AuthorRepository } from "@src/repositories/author.repository.port";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";

export class AuthorPrismaRepository implements AuthorRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}
	async getById(id: number): Promise<Required<Author>> {
		return this.#client.author.findFirstOrThrow({
			where: { id },
		});
	}

	async create(created: Creatable<Author>): Promise<Required<Author>> {
		return this.#client.author.create({
			data: { ...created },
		});
	}

	async update(
		id: number,
		updated: Updatable<Author>,
	): Promise<Required<Author>> {
		return this.#client.author.update({
			where: { id },
			data: { ...updated },
		});
	}

	async delete(id: number): Promise<void> {
		await this.#client.author.delete({
			where: { id },
		});
	}

	async list(query: Query): Promise<PaginatedResponse<Required<Author>[]>> {
		const { page, size } = query;
		const { limit, offset } = paginationToOffsetLimit({ page, size });
		const canQueryKey = ["name"];
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

		const [authors, total] = await this.#client.$transaction([
			this.#client.author.findMany({
				where,
				skip: offset,
				take: limit,
				orderBy: {
					id: "asc",
				},
			}),
			this.#client.author.count({ where }),
		]);
		return {
			detail: authors,
			pagination: {
				pages: Math.ceil(total / (size ?? 10)),
				items: total,
				current: page ?? 1,
				size: size ?? 10,
			},
		};
	}
}
