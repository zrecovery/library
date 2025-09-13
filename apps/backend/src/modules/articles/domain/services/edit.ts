import type { Updater } from "@articles/domain/interfaces/store";
import { ArticleUpdate } from "@articles/domain/types/update";
import { InvalidationError, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import {
  type StoreError,
  StoreErrorTag,
} from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import { Value } from "@sinclair/typebox/value";
import { Err, type Result } from "result";

const handlerError = (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case StoreErrorTag.NotFound:
      return new NotFoundError(`Not found article: ${id}`);

    default:
      return new UnknownError(
        `Unknown Store Error When updating article: ${id}, ${error.message}`,
        error,
      );
  }
};

export const edit =
  (logger: Logger, store: Updater) =>
  async (
    id: Id,
    data: ArticleUpdate,
  ): Promise<
    Result<null, InvalidationError | NotFoundError | UnknownError>
  > => {
    // 验证输入数据
    if (!Value.Check(ArticleUpdate, data)) {
      logger.debug("Invalid input data", data);
      return Err(new InvalidationError("Invalid input data."));
    }
    
    const result = await store.update(id, data);
    return result.mapErr(handlerError(id));
  };