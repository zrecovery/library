import { Creatable } from "@src/interfaces/common.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Author } from "@src/model";
import { AuthorRepository } from "../author.repository.port";

export class AuthorMockRepository implements AuthorRepository {
  getByName(author: Creatable<Author>): Promise<Author> {
    throw new Error("Method not implemented.");
  }
  getById(
    id: number,
    query?: Record<string, string | number | string[] | undefined> | undefined,
  ): Promise<Required<Author>> {
    return Promise.resolve(authorsMock[0]);
  }
  create(created: Creatable<Author>): Promise<Required<Author>> {
    return Promise.resolve(authorsMock[0]);
  }
  update(id: number, updated: Partial<Author>): Promise<Required<Author>> {
    return Promise.resolve(authorsMock[0]);
  }
  delete(id: number): Promise<void> {
    return Promise.resolve();
  }
  list(
    query?: Query | undefined,
  ): Promise<PaginatedResponse<Required<Author>[]>> {
    const result: PaginatedResponse<Required<Author>[]> = {
      detail: authorsMock,
      pagination: {
        items: 4,
        pages: 1,
        size: 10,
        current: 1,
      },
    };
    return Promise.resolve(result);
  }
}
