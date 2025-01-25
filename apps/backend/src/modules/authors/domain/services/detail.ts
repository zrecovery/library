import { type Id, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import {
  StoreErrorTag,
  type StoreError,
} from "@shared/domain/interfaces/store.error";
import type { Result } from "result";
import type { Find } from "../interfaces";
import type { AuthorDetail } from "../types";

const handlerError = (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case StoreErrorTag.NotFound:
      return new NotFoundError(`Not found author: ${id}`);

    default:
      return new UnknownError(
        `Unknown Store Error When find author: ${id}`,
        error,
      );
  }
};

export const detail =
  (logger: Logger, store: Find) =>
  async (
    id: Id,
  ): Promise<Result<AuthorDetail, NotFoundError | UnknownError>> => {
    logger.info("Finding author");
    const result = await store.find(id);
    return result.mapErr(handlerError(id));
  };
