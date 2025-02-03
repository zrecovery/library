import type { ChapterDetail } from "backend";
import { Err, Ok, type Result } from "result";
import { edenServer } from "../eden";
import {
  NotFoundWebRepositoryError,
  UnknownWebRepositoryError,
} from "../error";

export const detail = async (
  id: number,
): Promise<
  Result<ChapterDetail, NotFoundWebRepositoryError | UnknownWebRepositoryError>
> => {
  const { data, error } = await edenServer.api.chapters({ id }).get();
  switch (error?.status) {
    case undefined:
      break;
    case 404:
      return Err(new NotFoundWebRepositoryError(`Not Found, Id: ${id}`));
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
