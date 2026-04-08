import { TaggedError } from "tag-error";
import {
  ArticleListErrorEnum,
  ArticleListPort,
  type ArticleListResult,
} from "./port/type/findList";
import type { ArticleListFinder } from "./port/deps/ArticleListlFinder";
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
    const queryKeyword = async (keyword?: string) => {
      if (keyword) {
        const queryKeywordsResult = await this.#keywordHandler.handle(keyword);
        if (queryKeywordsResult.isErr()) {
          return undefined;
        }

        const queryKeywords = queryKeywordsResult.match({
          ok: (keywords) => keywords,
          err: () => undefined,
        });
        return queryKeywords;
      }
      return undefined;
    };
    const queryKeywords = await queryKeyword(keyword);

    const articleListFinderResult = await this.#articleListFinder.findList(
      pagination,
      queryKeywords,
    );

    return articleListFinderResult
      .map((result) => result)
      .mapErr(this.#FinderErrorHandler);
  };
}
