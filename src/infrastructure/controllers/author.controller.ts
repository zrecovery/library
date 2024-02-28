import type { AuthorService } from "@src/core/author/author.service";
import type { Author } from "@src/core/author/author.model";
import { t, type Context } from "elysia";
import { paginationToEntity } from "@src/utils/pagination.util";
import { Get } from "@src/utils/route.util";
import BaseController, { Route } from "@src/utils/BaseController";

const listQuery = t.Object({
  page: t.Optional(t.Numeric()),
  size: t.Optional(t.Numeric()),
});


export class AuthorController extends BaseController {
  routes: Route[];

  constructor(readonly authorService: AuthorService) {
    super("/authors");
  }

  @Get("/", { query: listQuery })
  public list = async ({ query }: Context): Promise<Author[]> => {
    const { page, size } = query;
    const { limit, offset } = paginationToEntity(page, size);
    return await this.authorService.list({ limit, offset });
  };
}
