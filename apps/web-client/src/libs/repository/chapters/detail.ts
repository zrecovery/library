import { Err, Ok, type Result } from "result";
import { edenServer } from "../eden";
import {
  NotFoundWebRepositoryError,
  UnknownWebRepositoryError,
} from "../error";

export const detail = async (id: number) => {
  const { data, error } = await edenServer.api.chapters({ id }).get();

  if (error) {
    switch (error.status) {
      case 404:
        return Err(
          new NotFoundWebRepositoryError(`Chapter not found, Id: ${id}`),
        );
      default:
        return Err(
          new UnknownWebRepositoryError(
            `Failed to fetch chapter: ${error.value || `Status code: ${error.status}`}`,
            error as unknown as Error,
          ),
        );
    }
  }

  if (!data) {
    return Err(
      new UnknownWebRepositoryError("No data received when fetching chapter"),
    );
  }

  return Ok(data);
};
