import type { ArticleListResponse } from "backend";
import { Err, Ok, type Result } from "result";
import { edenServer } from "../eden";
import { UnknownWebRepositoryError } from "../error";
import type { ListQuery } from "../schema";

export const list = async (
  query: ListQuery,
): Promise<Result<ArticleListResponse, UnknownWebRepositoryError>> => {
  const { data, error } = await edenServer.api.articles.index.get({ query });
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
