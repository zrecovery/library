import type { Creatable, Updatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
export declare abstract class BaseRepository<T> {
	abstract getById(id: number): Promise<Required<T>>;
	abstract create(created: Creatable<T>): Promise<Required<T>>;
	abstract update(id: number, updated: Updatable<T>): Promise<Required<T>>;
	abstract delete(id: number): Promise<void>;
	abstract list(query?: Query): Promise<PaginatedResponse<Required<T>[]>>;
}
