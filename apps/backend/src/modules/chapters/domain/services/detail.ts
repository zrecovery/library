import type { Finder } from "@chapters/domain/interfaces/store/find";
import { type Id, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import {
  type StoreError,
  StoreErrorTag,
} from "@shared/domain/interfaces/store.error";
import type { Result } from "result";
import type { ChapterDetail } from "../types";

const handlerError = (logger: Logger) => (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case StoreErrorTag.NotFound:
      return new NotFoundError(`Not found chapter: ${id}`);

    default:
      logger.trace(error);
      return new UnknownError(
        `Unknown Store Error When find chapter: ${id}, ${error.message}`,
        error,
      );
  }
};

export const detail =
  (logger: Logger, store: Finder) =>
  async (
    id: Id,
  ): Promise<Result<ChapterDetail, NotFoundError | UnknownError>> => {
    logger.info(`Finding chapter ${id}`);
    const result = await store.find(id);
    return result.mapErr(handlerError(logger)(id));
  };