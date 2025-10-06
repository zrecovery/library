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

  if (error) {
    switch (error.status) {
      case 404:
        return Err(
          new NotFoundWebRepositoryError(`Article not found, Id: ${id}`),
        );
      default:
        return Err(
          new UnknownWebRepositoryError(
            `Failed to delete article: ${error.value || `Status code: ${error.status}`}`,
            error as unknown as Error,
          ),
        );
    }
  }

  return Ok(null);
};
