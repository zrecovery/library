import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Chapter } from "@src/model";
import type { ChapterRepository } from "../series.repository.port";

export class ChapterMockRepository implements ChapterRepository {
	getById(
		id: number,
		query?: Record<string, string | number | string[] | undefined> | undefined,
	): Promise<Required<Chapter>> {
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
	list(
		query?: Query | undefined,
	): Promise<PaginatedResponse<Required<Chapter>[]>> {
		throw new Error("Method not implemented.");
	}
}
