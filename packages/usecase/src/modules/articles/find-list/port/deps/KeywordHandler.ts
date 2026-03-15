import { Type, Unknown, type Static } from "@sinclair/typebox";
import type { Result } from "result";

export const QueryKeywordsSchemaPort = Type.Object({
  positive: Type.Array(Type.String()),
  negative: Type.Array(Type.String()),
});

export type QueryKeywordsSchemaPort = Static<typeof QueryKeywordsSchemaPort>;

export const KeywordHandlerErrorEnum = Type.Enum({
  UnknownError: "Unknown Error",
});

export type KeywordHandlerError = Static<typeof KeywordHandlerErrorEnum>;

export interface KeywordHandler {
  handle(
    queryKeywords: string,
  ): Promise<Result<QueryKeywordsSchemaPort, KeywordHandlerError>>;
}
