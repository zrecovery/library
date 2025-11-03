import { Err, Ok } from "result";
import { edenServer } from "../eden";
import {
  NotFoundWebRepositoryError,
  UnknownWebRepositoryError,
} from "../error";

export const detail = async (id: number) => {
  const { data, error } = await edenServer.api.articles({ id }).get();

  if (error) {
    switch (error.status) {
      case 404:
        return Err(
          new NotFoundWebRepositoryError(`Article not found, Id: ${id}`),
        );
      default:
        return Err(
          new UnknownWebRepositoryError(
            `Failed to fetch article: ${error.value || `Status code: ${error.status}`}`,
            error as unknown as Error,
          ),
        );
    }
  }

  if (!data) {
    return Err(
      new UnknownWebRepositoryError("No data received when fetching article"),
    );
  }

  return Ok(data);
};
