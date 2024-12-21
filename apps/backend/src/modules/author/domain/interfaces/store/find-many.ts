import type {
  AuthorListResponse,
  AuthorQuery,
} from "@author/domain/types/list";

export interface FindMany {
  findMany(query: AuthorQuery): Promise<AuthorListResponse>;
}
