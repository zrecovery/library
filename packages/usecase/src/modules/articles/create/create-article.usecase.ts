import type { ArticleSaver } from "./port/deps/ArticleSaver";
import type { AuthorSaver } from "./port/deps/AuthorSaver";
import {
  ArticleCreateErrorEnum,
  ArticleCreatePort,
  type ArticleCreateResult,
} from "./port/type/create";
import { Ok, Err } from "result";
import type { ChapterSaver } from "./port/deps/ChapterSaver";
import { TaggedError } from "tag-error";
import type { SearchHandler } from "./port/deps/SearchHandler";
import { Value } from "@sinclair/typebox/value";

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

  execute = async (port: ArticleCreatePort): Promise<ArticleCreateResult> => {
    console.log(port);
    if (!Value.Check(ArticleCreatePort, port)) {
      return Err(
        new TaggedError("Invalid input", ArticleCreateErrorEnum.InvalidInput),
      );
    }
    const articleSaveResult = await this.#articleSaver.save(port);
    if (articleSaveResult.isErr()) {
      await this.#articleSaver.rollback();
      return articleSaveResult.map((id) => id).mapErr(this.#saverErrorHandler);
    }
    const articleId = articleSaveResult.unwrap();

    if (port.chapter) {
      const chapterSaver = await this.#chapterSaver.save({
        articleId,
        ...port.chapter,
      });
      console.log("chapter:");

      console.log(chapterSaver);
      if (chapterSaver.isErr()) {
        const err = chapterSaver.unwrapErr();
        await this.#chapterSaver.rollback();
        return Err(this.#saverErrorHandler(err));
      }
    }

    const authorSaver = await this.#authorSaver.save({
      articleId,
      ...port.author,
    });
    if (authorSaver.isErr()) {
      const err = authorSaver.unwrapErr();
      await this.#authorSaver.rollback();
      return Err(this.#saverErrorHandler(err));
    }

    const searchHandlerResult = await this.#searchHandler.index(
      articleId,
      port.body,
    );
    if (searchHandlerResult.isErr()) {
      const err = searchHandlerResult.unwrapErr();
      console.error(err);
      await this.#searchHandler.rollback();
      return Err(this.#saverErrorHandler(err));
    }

    return Ok(articleId);
  };
}
