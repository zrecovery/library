import type {
  ArticleSaver,
  ArticleSaverErrorEnum,
} from "./port/deps/ArticleSaver";
import type {
  AuthorSaver,
  AuthorSaverErrorEnum,
} from "./port/deps/AuthorSaver";
import {
  ArticleCreateErrorEnum,
  type ArticleCreatePort,
  type ArticleCreateResult,
} from "./port/type/create";
import { Ok, Err, type Result } from "result";
import type {
  ChapterSaver,
  ChapterSaverErrorEnum,
} from "./port/deps/ChapterSaver";
import { TaggedError } from "tag-error";
import type { SearchHandler } from "./port/deps/SearchHandler";

export class CreateArticleUseCase {
  readonly #articleSaver: ArticleSaver;
  readonly #authorSaver: AuthorSaver;
  readonly #chapterSaver: ChapterSaver;
  readonly #searchHandler: SearchHandler;
  constructor(
    articleSaver: ArticleSaver,
    authorSaver: AuthorSaver,
    chapterSaver: ChapterSaver,
    searchHandler: SearchHandler,
  ) {
    this.#articleSaver = articleSaver;
    this.#authorSaver = authorSaver;
    this.#chapterSaver = chapterSaver;
    this.#searchHandler = searchHandler;
  }

  #saverErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<ArticleCreateErrorEnum> => {
    switch (e.tag) {
      default:
        return new TaggedError(
          e.message,
          ArticleCreateErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  #saveResultHandler = <T>(result: Result<number, TaggedError<T>>) => {
    return result.map((id) => id).mapErr(this.#saverErrorHandler);
  };

  execute = async (port: ArticleCreatePort): Promise<ArticleCreateResult> => {
    const articleSaveResult = await this.#articleSaver.save(port);
    if (articleSaveResult.isErr()) {
      return articleSaveResult.map((id) => id).mapErr(this.#saverErrorHandler);
    }
    const articleId = articleSaveResult.unwrap();

    if (port.chapter) {
      const chapterSaver = await this.#chapterSaver.save({
        articleId,
        ...port.chapter,
      });
      if (chapterSaver.isErr()) {
        const err = chapterSaver.unwrapErr();
        return Err(this.#saverErrorHandler(err));
      }
    }

    const authorSaver = await this.#authorSaver.save({
      articleId,
      ...port.author,
    });
    if (authorSaver.isErr()) {
      const err = authorSaver.unwrapErr();
      return Err(this.#saverErrorHandler(err));
    }

    const searchHandlerResult = await this.#searchHandler.index(port.body);
    if (searchHandlerResult.isErr()) {
      const err = searchHandlerResult.unwrapErr();
      return Err(this.#saverErrorHandler(err));
    }

    return Ok(articleId);
  };
}
