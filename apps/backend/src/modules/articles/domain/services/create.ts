import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

const handlerError = (error: StoreError) => {
  switch (error._tag) {
    default:
      return new UnknownError(
        `Unknown Store Error When create article: ${error}`,
        error,
      );
  }
};

const loger = <A, F>(logger: Logger, f: (a: A) => F) => {
  logger.info("Starting the article creation process");
  logger.debug(`Received data for article creation ${a}`);
  return f;
};
export const create =
  (logger: Logger, store: Saver) =>
  async (data: ArticleCreate): Promise<Result<null, UnknownError>> => {
    const result = await store.save(data);
    return result.mapErr(handlerError);
  };
