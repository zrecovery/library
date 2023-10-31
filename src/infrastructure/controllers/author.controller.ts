import type { AuthorService } from "@/core/author/author.service";
import type { Author } from "@/core/author/model/author.model";
import type { Context } from "elysia";

export class AuthorController {
  constructor(readonly authorService: AuthorService) {}
  public list = async ({ query }: Context): Promise<Author[]> => {
    const { page, size } = query;
    const limit = size !== undefined ? Number(size) : 10;
    const count = page !== undefined ? Number(page) : 1;
    const offset = count * limit;
    return await this.authorService.list(limit, offset);
  };
}
