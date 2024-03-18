import { AuthorService } from "@src/core/author/author.service";
import type { Author } from "@src/core/author/author.model";
import { t, type Context, Elysia } from "elysia";
import { paginationToOffsetLimit } from "@src/utils/pagination.util";
import AuthorRepository from "@src/core/author/author.repository";
import { QueryResult } from "@src/core/schema/query-result.schema";

const listQuery = t.Object({
  page: t.Optional(t.Numeric()),
  size: t.Optional(t.Numeric()),
});

export class AuthorController {
  constructor(readonly authorService: AuthorService) {}

  public list = async ({ query }: Context): Promise<QueryResult<Author[]>> => {
    const { page, size } = query;
    const { limit, offset } = paginationToOffsetLimit(page, size);
    return await this.authorService.list({ limit, offset });
  };
}

export const AuthorModule = (repository: AuthorRepository) => {
  const authorService = new AuthorService(repository);
  const authorController = new AuthorController(authorService);

  const app = new Elysia();

  app.get("/authors", authorController.list, { query: listQuery });

  return app;
};
