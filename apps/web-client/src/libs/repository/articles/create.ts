import { Err, Ok, type Result } from "result";
import { edenServer } from "../eden";
import {
  InvalidateWebRepositoryError,
  UnknownWebRepositoryError,
} from "../error";
import type { CreatedSchema } from "../schema";

export const create = async (
  data: CreatedSchema,
): Promise<
  Result<null, InvalidateWebRepositoryError | UnknownWebRepositoryError>
> => {
  const { error } = await edenServer.api.articles.index.post(data);
  switch (error?.status) {
    case undefined:
      break;
    case 422:
      return Err(new InvalidateWebRepositoryError("Invalidate Request"));
    default:
      return Err(
        new UnknownWebRepositoryError(
          `Unknown Error, statuc code: ${error?.status}`,
        ),
      );
  }

  return Ok(null);
};
