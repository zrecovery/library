import type { ArticleListResponse } from "backend";
import { Err, Ok, type Result } from "result";
import type { ListQuery } from "../../schema";
import { edenServer } from "../eden";
import { UnknownWebRepositoryError } from "../error";

export const list = async (
  query: ListQuery,
): Promise<Result<ArticleListResponse, UnknownWebRepositoryError>> => {
  const { data, error } = await edenServer.api.articles.index.get({
    query: { page: query.page ?? 1, size: query.size ?? 10 },
  });
  switch (error?.status) {
    case undefined:
      break;
    default:
      return Err(
        new UnknownWebRepositoryError(
          `Unknown Error, statuc code: ${error?.status}`,
        ),
      );
  }
  if (!data) {
    return Err(new UnknownWebRepositoryError("Unknown Error"));
  }
  return Ok(data);
};
