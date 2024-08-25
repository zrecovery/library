import type { PrismaClient } from "@prisma/client";
import type { Creatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Chapter } from "@src/model";
import type { ChapterRepository } from "@src/repositories/series.repository.port";
export declare class ChapterPrismaRepository implements ChapterRepository {
	#private;
	constructor(client: PrismaClient);
	getById(id: number): Promise<Required<Chapter>>;
	create(created: Creatable<Chapter>): Promise<Required<Chapter>>;
	update(id: number, updated: Partial<Chapter>): Promise<Required<Chapter>>;
	delete: (id: number) => Promise<void>;
	list: (query: Query) => Promise<PaginatedResponse<Required<Chapter>[]>>;
}
