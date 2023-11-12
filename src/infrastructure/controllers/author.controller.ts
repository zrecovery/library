import type { AuthorService } from "@/core/author/author.service";
import type { Author } from "@/core/author/author.model";
import type { Context } from "elysia";
import { pagination } from "@/utils/pagination.util";

export class AuthorController {
  constructor(readonly authorService: AuthorService) {}
  public list = async ({ query }: Context): Promise<Author[]> => {
    const { page, size } = query;
    const { limit, offset } = pagination(Number(page), Number(size));
    return await this.authorService.list(limit, offset);
  };
}
