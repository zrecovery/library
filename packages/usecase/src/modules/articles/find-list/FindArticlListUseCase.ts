import { TaggedError } from "tag-error";
import {
  ArticleListErrorEnum,
  ArticleListPort,
  type ArticleListResult,
} from "./port/type/findList";
import type { ArticleListFinder } from "./port/deps/ArticleDetailFinder";
import type { KeywordHandler } from "./port/deps/KeywordHandler";
import { Err } from "result";

export class FindArticleListUseCase {
  readonly #articleListFinder: ArticleListFinder;
  readonly #keywordHandler: KeywordHandler;
  constructor(
    articleListFinder: ArticleListFinder,
    keywordHandler: KeywordHandler,
  ) {
    this.#articleListFinder = articleListFinder;
    this.#keywordHandler = keywordHandler;
  }

  #FinderErrorHandler = <T>(
    e: TaggedError<T>,
  ): TaggedError<ArticleListErrorEnum> => {
    switch (e.tag) {
      default:
        return new TaggedError(
          e.message,
          ArticleListErrorEnum.UnknownError,
          e.stack,
        );
    }
  };

  execute = async (port: ArticleListPort): Promise<ArticleListResult> => {
    const { pagination, keyword } = port;
    const queryKeywordsResult = await this.#keywordHandler.handle(keyword);
    if (queryKeywordsResult.isErr()) {
      return Err(
        new TaggedError(
          queryKeywordsResult.unwrapErr(),
          ArticleListErrorEnum.UnknownError,
        ),
      );
    }
    const queryKeywords = queryKeywordsResult.match({
      ok: (keywords) => keywords,
      err: () => undefined,
    });
    const articleListFinderResult = await this.#articleListFinder.find(
      pagination,
      queryKeywords,
    );
    return articleListFinderResult
      .map((result) => result)
      .mapErr(this.#FinderErrorHandler);
  };
}
