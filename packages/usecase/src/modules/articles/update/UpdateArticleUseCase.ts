import type {
  ArticleUpdater,
  ArticleUpdaterErrorEnum,
} from "./port/deps/ArticleUpdater";
import type {
  AuthorUpdater,
  AuthorUpdaterErrorEnum,
} from "./port/deps/AuthorUpdater";
import {
  ArticleUpdateErrorEnum,
  type ArticleUpdatePort,
  type ArticleUpdateResult,
} from "./port/type/update";
import { Ok, Err, type Result } from "result";
import type {
  ChapterUpdater,
  ChapterUpdaterErrorEnum,
} from "./port/deps/ChapterUpdater";
import { TaggedError } from "tag-error";
import type { SearchUpdateHandler } from "./port/deps/SearchUpdateHandler";

export class UpdateArticleUseCase {
  readonly #articleUpdater: ArticleUpdater;
  readonly #authorUpdater: AuthorUpdater;
  readonly #chapterUpdater: ChapterUpdater;
  readonly #searchUpdateHandler: SearchUpdateHandler;
  constructor(
    articleUpdater: ArticleUpdater,
    authorUpdater: AuthorUpdater,
    chapterUpdater: ChapterUpdater,
    searchHandler: SearchUpdateHandler,
  ) {
    this.#articleUpdater = articleUpdater;
    this.#authorUpdater = authorUpdater;
    this.#chapterUpdater = chapterUpdater;
    this.#searchUpdateHandler = searchHandler;
  }

  #UpdaterErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<ArticleUpdateErrorEnum> => {
    switch (e.tag) {
      default:
        return new TaggedError(
          e.message,
          ArticleUpdateErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  #updateResultHandler = <T>(result: Result<number, TaggedError<T>>) => {
    return result.map((id) => id).mapErr(this.#UpdaterErrorHandler);
  };

  execute = async (port: ArticleUpdatePort): Promise<ArticleUpdateResult> => {
    if (port.article) {
      const articleUpdateResult = await this.#articleUpdater.update(
        port.article,
      );
      if (articleUpdateResult.isErr()) {
        return Err(this.#UpdaterErrorHandler(articleUpdateResult.unwrapErr()));
      }
      if (port.article.body) {
        const searchHandlerResult = await this.#searchUpdateHandler.updateIndex(
          port.article.body,
        );
        if (searchHandlerResult.isErr()) {
          const err = searchHandlerResult.unwrapErr();
          return Err(this.#UpdaterErrorHandler(err));
        }
      }
    }

    if (port.chapter) {
      const chapterUpdater = await this.#chapterUpdater.Update({
        articleId: port.id,
        ...port.chapter,
      });
      if (chapterUpdater.isErr()) {
        const err = chapterUpdater.unwrapErr();
        return Err(this.#UpdaterErrorHandler(err));
      }
    }

    if (port.author) {
      const authorUpdater = await this.#authorUpdater.update({
        articleId: port.id,
        ...port.author,
      });
      if (authorUpdater.isErr()) {
        const err = authorUpdater.unwrapErr();
        return Err(this.#UpdaterErrorHandler(err));
      }
    }

    return Ok(null);
  };
}
