import type { Find } from "@article/domain/interfaces/store";
import type { ArticleDetail } from "@article/domain/types/detail";

import  { type StoreError, StoreErrorType } from "@shared/domain/interfaces/store.error";

import { Effect } from "effect";
import type { Logger } from "src/interface/logger";
import type { Id } from "src/model";

class NotFoundError extends Error {
  constructor(id: Id) {
    super(`Article not found by id: ${id}`);
  }
    readonly _tag = "NotFoundError";
}

class UnknownError extends Error {
  constructor(error: StoreError) {
    super(`Unknown error. ${error.message}`);
  }

  readonly _tag = "UnknownError";
}

const ErrorHandler = (id: Id)=>(error: StoreError) => {
    switch (error.type) {
      case StoreErrorType.NotFound:
        return new NotFoundError(id);
      default:
        return new UnknownError(error);
    }

}

export const detail =
  (logger: Logger, store: Find) =>
  async (id: Id): Promise<Effect.Effect<ArticleDetail, NotFoundError | UnknownError>> =>  {
    logger.debug({ id }, "Finding article");

      const result = await store.find(id);

      return Effect.matchEffect(result,{
        onFailure: (err)=> {
          return Effect.fail(ErrorHandler(id)(err));
        },
        onSuccess: (val) => {
          return Effect.succeed(val);
        }
      });

  };
