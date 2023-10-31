import type { Author } from "@/core/author/model/author.model";

export default interface AuthorRepository {
  getList: (limit?: number, offset?: number) => Promise<Author[]>;
}
