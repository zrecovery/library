import { TaggedError } from "tag-error";
import type {
  ArticleDetailFinder,
  ArticleDetailPort,
} from "./port/deps/ArticleDetailFinder";
import {
  ArticleDetailErrorEnum,
  type ArticleDetailResult,
} from "./port/type/findDetail";

export class FindArticleDetailUseCase {
  readonly #articleDetailFinder: ArticleDetailFinder;
  constructor(articleDetailFinder: ArticleDetailFinder) {
    this.#articleDetailFinder = articleDetailFinder;
  }

  #FinderErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<ArticleDetailErrorEnum> => {
    switch (e.tag) {
      case ArticleDetailErrorEnum.NotFound:
        return new TaggedError(
          e.message,
          ArticleDetailErrorEnum.NotFound,
          e.stack,
        );
      default:
        return new TaggedError(
          e.message,
          ArticleDetailErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  execute = async (port: ArticleDetailPort): Promise<ArticleDetailResult> => {
    const articleDetailFinderResult =
      await this.#articleDetailFinder.findDetailById(port);
    return articleDetailFinderResult
      .map((result) => result)
      .mapErr(this.#FinderErrorHandler);
  };
}
