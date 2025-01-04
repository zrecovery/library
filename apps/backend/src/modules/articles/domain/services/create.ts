import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import type { Result } from "result";

const errorHandler = (error: StoreError) => {
  switch (error._tag) {
    default:
      return new UnknownError(
        `Unknown Store Error When create article: ${error}`,
        error,
      );
  }
};

export const create =
  (logger: Logger, store: Saver) =>
  async (data: ArticleCreate): Promise<Result<null, UnknownError>> => {
    const result = await store.save(data);
    return result.mapErr(errorHandler);
  };
