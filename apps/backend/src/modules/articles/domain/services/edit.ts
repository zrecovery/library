import type { Updater } from "@articles/domain/interfaces/store";
import { ArticleUpdate } from "@articles/domain/types/update";
import { InvalidationError, NotFoundError, UnknownError } from "@shared/domain";
import type { Logger } from "@shared/domain/interfaces/logger";
import { StoreErrorTag, type StoreError } from "@shared/domain/interfaces/store.error";
import type { Id } from "@shared/domain/types/common";
import { Value } from "@sinclair/typebox/value";
import { Err, type Result } from "result";

const ErrorHandler = (id: Id) => (error: StoreError) => {
  switch (error._tag) {
    case StoreErrorTag.NotFound:
      return new NotFoundError(`Not found article: ${id}`);

    default:
      return new UnknownError(
        `Unknown Store Error When find article: ${id}`,
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
    if (!Value.Check(ArticleUpdate, data)) {
      return Err(new InvalidationError(`输入异常：${data}`));
    }
    const result = await store.update(id, data);
    const response = result.mapErr(ErrorHandler(id));
    return response;
  };
