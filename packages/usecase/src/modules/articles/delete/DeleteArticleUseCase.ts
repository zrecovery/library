import type { ArticleDeleter } from "./port/deps/ArticleDelete";
import type { AuthorDeleter } from "./port/deps/AuthorDelete";
import {
  ArticleDeleteErrorEnum,
  type ArticleDeletePort,
  type ArticleDeleteResult,
} from "./port/type/delete";
import { Ok, Err } from "result";
import type { ChapterDeleter } from "./port/deps/ChapterDelete";
import { TaggedError } from "tag-error";
import type { SearchDeleter } from "./port/deps/SearchDelete";

export class DeleteArticleUseCase {
  readonly #articleDeleter: ArticleDeleter;
  readonly #authorDeleter: AuthorDeleter;
  readonly #chapterDeleter: ChapterDeleter;
  readonly #searchDeleter: SearchDeleter;
  constructor(
    articleDeleter: ArticleDeleter,
    authorDeleter: AuthorDeleter,
    chapterDeleter: ChapterDeleter,
    searchDeleter: SearchDeleter,
  ) {
    this.#articleDeleter = articleDeleter;
    this.#authorDeleter = authorDeleter;
    this.#chapterDeleter = chapterDeleter;
    this.#searchDeleter = searchDeleter;
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
    const searchDeleteResult = await this.#searchDeleter.delete(port);
    if (searchDeleteResult.isErr()) {
      return Err(this.#deleteErrorHandler(searchDeleteResult.unwrapErr()));
    }

    const chapterDeleteResult = await this.#chapterDeleter.delete(port);
    if (chapterDeleteResult.isErr()) {
      return Err(this.#deleteErrorHandler(chapterDeleteResult.unwrapErr()));
    }

    const authorDeleteResult = await this.#authorDeleter.delete(port);
    if (authorDeleteResult.isErr()) {
      return Err(this.#deleteErrorHandler(authorDeleteResult.unwrapErr()));
    }

    const articleDeleteResult = await this.#articleDeleter.delete(port);
    if (articleDeleteResult.isErr()) {
      return Err(this.#deleteErrorHandler(articleDeleteResult.unwrapErr()));
    }

    return Ok(null);
  };
}
