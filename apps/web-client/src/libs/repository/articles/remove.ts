import { Err, Ok, type Result } from "result";
import { edenServer } from "../eden";
import {
  type InvalidateWebRepositoryError,
  NotFoundWebRepositoryError,
  UnknownWebRepositoryError,
} from "../error";

export const remove = async (
  id: number,
): Promise<
  Result<null, InvalidateWebRepositoryError | UnknownWebRepositoryError>
> => {
  const { error } = await edenServer.api.articles({ id }).delete();
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

  return Ok(null);
};
