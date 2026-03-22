import type { Database, Transaction } from "@shared/db";
import { Err, Ok, type Result } from "result";
import type { SearchHandler } from "@library/usecase/articles/create";
import type { TaggedError } from "tag-error";

export class KeywordHandlerRepository implements SearchHandler {
  #db: Transaction;
  constructor(readonly db: Transaction) {
    this.#db = db;
  }
  index(content: string): Promise<Result<null, TaggedError<"Unknown Error">>> {
    throw new Error("Method not implemented.");
  }
  handle = async (
    queryKeywords: string,
  ): Promise<
    Result<{ positive: string[]; negative: string[] }, "Unknown Error">
  > => {
    const terms = queryKeywords.trim().split(/\s+/);
    const positive: string[] = [];
    const negative: string[] = [];

    for (const term of terms) {
      if (term.startsWith("-")) {
        negative.push(term.substring(1));
      } else {
        positive.push(term);
      }
    }

    return Ok({ positive, negative });
  };
}
