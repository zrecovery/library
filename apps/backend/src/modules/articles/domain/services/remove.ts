import type { Remover } from "@articles/domain/interfaces/store";
import type { Logger } from "@shared/domain/interfaces/logger";
import {
  StoreErrorTag,
  type StoreError,
} from "@shared/domain/interfaces/store.error";
import { type Id, NotFoundError, UnknownError } from "@shared/domain/types";
import type { Result } from "result";

const handlerError = (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case StoreErrorTag.NotFound:
      return new NotFoundError(`Not found article: ${id}`);

    default:
      return new UnknownError(
        `Unknown Store Error When removing article: ${id}, ${error.message}`,
        error,
      );
  }
};

export const remove =
  (logger: Logger, store: Remover) =>
  async (id: Id): Promise<Result<null, NotFoundError | UnknownError>> => {
    logger.debug(`Removing article ${id}`);
    const result = await store.remove(id);
    return result.mapErr(handlerError(id));
  };
