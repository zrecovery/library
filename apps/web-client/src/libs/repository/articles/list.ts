import type { ArticleListResponse } from "backend";
import { Err, Ok, type Result } from "result";
import type { ListQuery } from "../../schema";
import { edenServer } from "../eden";
import { UnknownWebRepositoryError } from "../error";

export const list = async (
  query: ListQuery,
): Promise<Result<ArticleListResponse, UnknownWebRepositoryError>> => {
  const { data, error } = await edenServer.api.articles.get({
    query: { page: query.page ?? 1, size: query.size ?? 10 },
  });

  if (error) {
    return Err(
      new UnknownWebRepositoryError(
        `Failed to fetch articles: ${error.value} || Status code: ${error.status}`,
        error as unknown as Error,
      ),
    );
  }

  if (!data) {
    return Err(
      new UnknownWebRepositoryError("No data received when fetching articles"),
    );
  }

  return Ok(data);
};
