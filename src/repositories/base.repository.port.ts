import { Creatable, Updatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";

export abstract class BaseRepository<T> {
  abstract getById(
    id: number,
    query?: Record<string, string | string[] | number | undefined>,
  ): Promise<Required<T>>;
  abstract create(created: Creatable<T>): Promise<Required<T>>;
  abstract update(id: number, updated: Updatable<T>): Promise<Required<T>>;
  abstract delete(id: number): Promise<void>;
  abstract list(query?: Query): Promise<PaginatedResponse<Required<T>[]>>;
}
