import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Series } from "@src/model";
import type { SeriesRepository } from "../series.repository.port";

export class SeriesMockRepository implements SeriesRepository {
	getById(
		id: number,
		query?: Record<string, string | number | string[] | undefined> | undefined,
	): Promise<Required<Series>> {
		return Promise.resolve({
			id: 1,
			title: "series title",
			created_at: new Date(),
			updated_at: new Date(),
		});
	}
	create(created: Creatable<Series>): Promise<Required<Series>> {
		return Promise.resolve({
			id: 1,
			title: "series title",
			created_at: new Date(),
			updated_at: new Date(),
		});
	}

	update(id: number, updated: Partial<Series>): Promise<Required<Series>> {
		return Promise.resolve({
			id: 1,
			title: "series title",
			created_at: new Date(),
			updated_at: new Date(),
		});
	}

	delete(id: number): Promise<void> {
		return Promise.resolve();
	}

	list(
		query?: Query | undefined,
	): Promise<PaginatedResponse<Required<Series>[]>> {
		const result: PaginatedResponse<Required<Series>[]> = {
			detail: [
				{
					id: 1,
					title: "series title",
					created_at: new Date(),
					updated_at: new Date(),
				},
			],
			pagination: {
				items: 1,
				pages: 1,
				size: 10,
				current: 1,
			},
		};
		return Promise.resolve(result);
	}
}
