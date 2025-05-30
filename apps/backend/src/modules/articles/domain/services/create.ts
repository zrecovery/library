import type { Saver } from "@articles/domain/interfaces/store";
import type { ArticleCreate } from "@articles/domain/types/create";
import { UnknownError, type Logger } from "@shared/domain";
import type { StoreError } from "@shared/domain/interfaces/store.error";
import { log } from "@utils/decorators/log";
import type { Result } from "result";

/*
export class ArticleCreatorService {
  #logger: Logger;
  #saver: Saver;

<<<<<<< HEAD
  constructor(logger: Logger, saver: Saver) {
    this.#logger = logger;
    this.#saver = saver;
  }

  #handlerError = (error: StoreError) => {
    switch (error._tag) {
      default:
        return new UnknownError(
          `Unknown Store Error When create article: ${error}`,
          error,
        );
    }
  };

  @log("info","hello")
  accessor execute = async (data: ArticleCreate): Promise<Result<null, UnknownError>> => {
    const result = await this.#saver.save(data);
    return result.mapErr(this.#handlerError);
  };
}
 */
const handlerError = (error: StoreError) => {
    console.error(error)
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
    return result.mapErr(handlerError);
  };
