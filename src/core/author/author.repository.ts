import type { Author } from "@/core/author/author.model";

export default interface AuthorRepository {
  getList: (limit?: number, offset?: number) => Promise<Author[]>;
}
