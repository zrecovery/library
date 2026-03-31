import type { ArticleDeleter } from "./port/deps/ArticleDelete";
import {
  ArticleDeleteErrorEnum,
  type ArticleDeletePort,
  type ArticleDeleteResult,
} from "./port/type/delete";
import { Ok, Err } from "result";
import type { ChapterDeleter } from "./port/deps/ChapterDelete";
import { TaggedError } from "tag-error";

export class DeleteArticleUseCase {
  readonly #articleDeleter: ArticleDeleter;
  constructor(articleDeleter: ArticleDeleter) {
    this.#articleDeleter = articleDeleter;
  }

  #deleteErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<ArticleDeleteErrorEnum> => {
    switch (e.tag) {
      default:
        return new TaggedError(
          e.message,
          ArticleDeleteErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  execute = async (port: ArticleDeletePort): Promise<ArticleDeleteResult> => {
    const articleDeleteResult = await this.#articleDeleter.delete(port);
    if (articleDeleteResult.isErr()) {
      this.#articleDeleter.rollback();
      return Err(this.#deleteErrorHandler(articleDeleteResult.unwrapErr()));
    }

    return Ok(null);
  };
}
