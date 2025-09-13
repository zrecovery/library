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
  
  if (error) {
    switch (error.status) {
      case 422:
        return Err(new InvalidateWebRepositoryError("Invalid request data"));
      default:
        return Err(
          new UnknownWebRepositoryError(
            `Failed to create article: ${error.value || `Status code: ${error.status}`}`,
            error as unknown as Error
          ),
        );
    }
  }

  return Ok(null);
};