import type {
  KeywordHandler,
  KeywordHandlerError,
  QueryKeywordsSchemaPort,
} from "@articles/find-list/port/deps/KeywordHandler";
import type { Transaction } from "@shared/infrastructure/repostiory/db";
import { Ok, type Result } from "result";

export class SearchRepository implements KeywordHandler {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  handle = async (
    queryKeywords: string,
  ): Promise<Result<QueryKeywordsSchemaPort, KeywordHandlerError>> => {
    const keywords = queryKeywords.split(",").map((k) => k.trim());
    return Ok({
      positive: keywords.filter((k) => !k.startsWith("-")),
      negative: keywords.filter((k) => k.startsWith("-")),
    });
  };
  rollback = (): Promise<void> => {
    return this.#tx.rollback();
  };
}
