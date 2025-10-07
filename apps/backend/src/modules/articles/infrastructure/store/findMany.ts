import type { Lister } from "@articles/domain/index.ts";
import type {
  ArticleListResponse,
  ArticleMeta,
} from "@articles/domain/types/list.ts";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error.ts";
import type { Pagination } from "@shared/domain/types/common";
import type { Database } from "@shared/infrastructure/store/db";
import { libraryView } from "@shared/infrastructure/store/schema.ts";
import { type SQL, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";

// ============================================================================
// Types
// ============================================================================

type QueryRow = {
  article: { id: number | null; title: string | null };
  author: { id: number | null; name: string | null };
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
  total: number;
};

type KeywordParts = {
  readonly positive: ReadonlyArray<string>;
  readonly negative: ReadonlyArray<string>;
};

// ============================================================================
// Pure Functions - Data Transformation
// ============================================================================

/**
 * Converts query result to ArticleMeta
 */
const toArticleMeta = (result: QueryRow): ArticleMeta => {
  if (result.article.id === null) {
    throw new Error("Article ID cannot be null");
  }
  if (result.article.title === null) {
    throw new Error("Article title cannot be null");
  }

  return {
    id: result.article.id,
    title: result.article.title,
    author: {
      id: result.author.id ?? 0,
      name: result.author.name ?? "",
    },
    chapter:
      result.chapter.id !== null
        ? {
            id: result.chapter.id,
            title: result.chapter.title ?? "",
            order: result.chapter.order ?? 0,
          }
        : undefined,
  };
};

/**
 * Transforms array of results to ArticleMeta list
 */
const transformToArticleMetaList = (
  rows: ReadonlyArray<QueryRow>,
): ArticleMeta[] => {
  try {
    return rows.map(toArticleMeta);
  } catch (error) {
    throw new UnknownStoreError(
      "Failed to transform query results",
      error instanceof Error ? error : undefined,
    );
  }
};

/**
 * Extracts pagination information from results
 */
const extractPaginationInfo = (
  rows: ReadonlyArray<QueryRow>,
  page: number,
  size: number,
) => {
  const totalItems = rows.length > 0 ? Number(rows[0].total) : 0;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / size) : 0;

  return {
    current: page,
    pages: totalPages,
    size,
    items: totalItems,
  };
};

/**
 * Builds the complete list response
 */
const buildListResponse = (
  rows: ReadonlyArray<QueryRow>,
  page: number,
  size: number,
): ArticleListResponse => ({
  data: transformToArticleMetaList(rows),
  pagination: extractPaginationInfo(rows, page, size),
});

// ============================================================================
// Pure Functions - Keyword Processing
// ============================================================================

/**
 * Filters positive keywords (with + prefix)
 */
const extractPositiveKeywords = (parts: ReadonlyArray<string>): string[] =>
  parts
    .filter((part) => part.startsWith("+"))
    .map((part) => part.slice(1))
    .filter((keyword) => keyword.length > 0);

/**
 * Filters negative keywords (with - prefix)
 */
const extractNegativeKeywords = (parts: ReadonlyArray<string>): string[] =>
  parts
    .filter((part) => part.startsWith("-"))
    .map((part) => part.slice(1))
    .filter((keyword) => keyword.length > 0);

/**
 * Parses keyword string into positive and negative parts
 */
const parseKeywordParts = (keyword: string): KeywordParts => {
  const parts = keyword.trim().split(" ").filter(Boolean);

  return {
    positive: extractPositiveKeywords(parts),
    negative: extractNegativeKeywords(parts),
  };
};

/**
 * Builds the query string for full-text search
 */
const buildSearchQuery = (parts: KeywordParts): string => {
  const positiveQuery = parts.positive.join("  ");
  const negativeQuery = parts.negative
    .map((keyword) => `-${keyword}`)
    .join("  ");

  return [positiveQuery, negativeQuery]
    .filter(Boolean)
    .join("  ")
    .trim();
};

/**
 * Verifies if keyword parts are valid
 */
const hasValidKeywordParts = (parts: KeywordParts): boolean =>
  parts.positive.length > 0 || parts.negative.length > 0;

/**
 * Builds the SQL condition for keyword search
 */
const buildKeywordCondition = (keyword: string): SQL | undefined => {
  const parts = parseKeywordParts(keyword);

  if (!hasValidKeywordParts(parts)) {
    return undefined;
  }

  const searchQuery = buildSearchQuery(parts);
  return sql`${libraryView.body} &@~ ${searchQuery}`;
};

// ============================================================================
// Pure Functions - Pagination
// ============================================================================

/**
 * Calculates the offset for pagination
 */
const calculateOffset = (page: number, size: number): number =>
  (page - 1) * size;

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Builds the base query for listing articles
 */
const buildListQuery = (
  db: Database,
  page: number,
  size: number,
  condition?: SQL,
) => {
  const offset = calculateOffset(page, size);

  const baseQuery = db
    .select({
      article: {
        id: libraryView.id,
        title: libraryView.title,
      },
      author: {
        id: libraryView.people_id,
        name: libraryView.people_name,
      },
      chapter: {
        id: libraryView.series_id,
        title: libraryView.series_title,
        order: libraryView.chapter_order,
      },
      total: sql<number>`count(*) OVER()`,
    })
    .from(libraryView)
    .orderBy(
      libraryView.people_id,
      libraryView.series_id,
      libraryView.chapter_order,
    )
    .limit(size)
    .offset(offset);

  return condition ? baseQuery.where(condition) : baseQuery;
};

/**
 * Executes the query and returns results
 */
const executeListQuery =
  (db: Database) =>
  async (
    page: number,
    size: number,
    condition?: SQL,
  ): Promise<QueryRow[]> => {
    const query = buildListQuery(db, page, size, condition);
    return query;
  };

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handles errors and converts them to the appropriate type
 */
const handleListError = (error: unknown): UnknownStoreError => {
  if (error instanceof UnknownStoreError) {
    return error;
  }

  if (error instanceof Error) {
    return new UnknownStoreError("Database query failed", error);
  }

  return new UnknownStoreError(`Unknown error: ${String(error)}`);
};

// ============================================================================
// Orchestration
// ============================================================================

/**
 * Executes the search with all necessary steps
 */
const executeFindMany =
  (db: Database) =>
  async (
    query: Pagination & { keyword?: string },
  ): Promise<Result<ArticleListResponse, UnknownStoreError>> => {
    const { page, size, keyword } = query;

    try {
      const condition = keyword ? buildKeywordCondition(keyword) : undefined;
      const rows = await executeListQuery(db)(page, size, condition);
      const response = buildListResponse(rows, page, size);

      return Ok(response);
    } catch (error) {
      return Err(handleListError(error));
    }
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a functional Lister for articles
 */
export const createDrizzleLister = (db: Database): Lister => ({
  findMany: executeFindMany(db),
});

/**
 * Legacy class for backward compatibility
 * @deprecated Use createDrizzleLister instead
 */
export class DrizzleLister implements Lister {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  findMany = (query: Pagination & { keyword?: string }): Promise<Result<ArticleListResponse, UnknownStoreError>> => {
    return executeFindMany(this.#db)(query);
  };
}

// ============================================================================
// Deprecated Exports (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use parseKeywordParts and buildKeywordCondition instead
 */
export const spliteKeyword = (keyword: string): string[] => keyword.split("|");
