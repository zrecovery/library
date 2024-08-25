import type { PrismaClient } from "@prisma/client";
import type { Person } from "model/domain";
import type { Creatable } from "model/protocol";
import type { Query, PaginatedResponse } from "model/schema";
import { convertPageToOffset, convertPaginationDetail } from "pagination";
import type { PersonBaseRepository } from "src/repositories/bussiness/base.port";

export class PersonBasePrismaRepository implements PersonBaseRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}

	update = (id: number, data: Partial<Person>): Promise<Required<Person>> =>
		this.#client.person.update({ where: { id }, data });

	remove = async (id: number): Promise<void> => {
		await this.#client.person.delete({ where: { id } });
	};

	findMany = async (
		query?: Query,
	): Promise<PaginatedResponse<Required<Person>[]>> => {
		const { page, size } = query || {};
		const count = await this.#client.person.count({ select: { id: true } });
		const { limit, offset } = convertPageToOffset({ page, size });
		const data = await this.#client.person.findMany({
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
		name?: string;
		id?: number;
	}): Promise<Required<Person> | null> =>
		this.#client.person.findFirst({ where: query });

	create = async ({ name }: Creatable<Person>) =>
		this.#client.person.create({ data: { name } });
}
