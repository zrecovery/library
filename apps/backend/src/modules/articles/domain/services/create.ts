import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError, type Logger } from "@shared/domain";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

const handlerError = (error: StoreError) => {
  switch (error._tag) {
    default:
      return new UnknownError(
        `Unknown Store Error When create article: ${error.message}`,
        error,
      );
  }
};

export const create =
  (logger: Logger, store: Saver) =>
  async (data: ArticleCreate): Promise<Result<null, UnknownError>> => {
    const result = await store.save(data);
    return result.mapErr(handlerError);
  };
