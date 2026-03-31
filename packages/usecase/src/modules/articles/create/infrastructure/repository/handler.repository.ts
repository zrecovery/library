import type { Id } from "@library/domain/common";
import {
  SearchHandlerErrorEnum,
  type SearchHandler,
} from "@library/usecase/articles/create";
import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";

import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class SearchHandlerRepository implements SearchHandler {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback = async (): Promise<void> => {
    this.#tx.rollback();
  };
  #countKeyword = (content: string, keyword: string): number => {
    return content.split(keyword).length - 1;
  };
  index = async (
    articleId: Id,
    content: string,
  ): Promise<Result<null, TaggedError<SearchHandlerErrorEnum>>> => {
    const keywords = await this.#tx
      .select({
        id: schema.keywords.id,
        keyword: schema.keywords.keyword,
      })
      .from(schema.keywords);

    const keywordCounts = keywords
      .map((keyword) => {
        return {
          articleId: articleId,
          keywordId: keyword.id,
          count: this.#countKeyword(content, keyword.keyword),
        };
      })
      .filter((keyword) => keyword.count > 0);

    try {
      const saveIndex = await this.#tx
        .insert(schema.articleKeywords)
        .values(keywordCounts)
        .execute();
    } catch (e) {
      return Err(
        new TaggedError(
          "Unknown",
          SearchHandlerErrorEnum.UnknownError,
          (e as Error).stack,
        ),
      );
    }
    return Ok(null);
  };
}
