import { ArticleDetail } from "@articles/domain/types/detail.ts";
import { ArticleMeta } from "@articles/domain/types/list.ts";
import { Value } from "@sinclair/typebox/value";

// ============================================================================
// Types
// ============================================================================

/**
 * Query result for fetching complete article details
 */
export type FindResult = {
  readonly article: {
    readonly id: number | null;
    readonly title: string | null;
    readonly body: string | null;
  };
  readonly author: {
    readonly id: number | null;
    readonly name: string | null;
  };
  readonly chapter: {
    readonly id: number | null;
    readonly title: string | null;
    readonly order: number | null;
  };
};

/**
 * Query result for fetching article metadata
 */
export type MetaResult = {
  readonly article: {
    readonly id: number;
    readonly title: string;
  };
  readonly author: {
    readonly id: number | null;
    readonly name: string | null;
  };
  readonly chapter: {
    readonly id: number | null;
    readonly title: string | null;
    readonly order: number | null;
  };
};

/**
 * Partial chapter before validation
 */
type PartialChapter = {
  readonly id: number;
  readonly title: string;
  readonly order: number;
};

// ============================================================================
// Pure Functions - Chapter Transformation
// ============================================================================

/**
 * Checks if a chapter has all required fields
 */
const hasCompleteChapterData = (chapter: {
  readonly id: number | null;
  readonly title: string | null;
  readonly order: number | null;
}): chapter is { id: number; title: string; order: number } =>
  chapter.id !== null && chapter.title !== null && chapter.order !== null;

/**
 * Creates a chapter object with complete fields
 */
const createChapter = (chapter: {
  readonly id: number;
  readonly title: string;
  readonly order: number;
}): PartialChapter => ({
  id: chapter.id,
  title: chapter.title,
  order: chapter.order,
});

/**
 * Transforms optional chapter from DB result
 */
const transformChapter = (
  chapter: FindResult["chapter"] | MetaResult["chapter"],
): PartialChapter | undefined =>
  hasCompleteChapterData(chapter) ? createChapter(chapter) : undefined;

// ============================================================================
// Pure Functions - Author Transformation
// ============================================================================

/**
 * Transforms author data from DB result
 */
const transformAuthor = (author: {
  readonly id: number | null;
  readonly name: string | null;
}) => ({
  id: author.id ?? 0,
  name: author.name ?? "",
});

// ============================================================================
// Pure Functions - Article Transformation
// ============================================================================

/**
 * Combines article, author and chapter into a complete object
 */
const combineArticleData = <T extends MetaResult | FindResult>(
  result: T,
): T extends FindResult
  ? Omit<ArticleDetail, never>
  : Omit<ArticleMeta, never> => {
  const chapter = transformChapter(result.chapter);
  const author = transformAuthor(result.author);

  return {
    ...result.article,
    author,
    chapter,
  } as any;
};

// ============================================================================
// Pure Functions - Validation
// ============================================================================

/**
 * Validates and parses the result as ArticleDetail using TypeBox
 */
const validateAndParseDetail = (data: unknown): ArticleDetail =>
  Value.Parse(ArticleDetail, data);

/**
 * Validates and parses the result as ArticleMeta using TypeBox
 */
const validateAndParseMeta = (data: unknown): ArticleMeta =>
  Value.Parse(ArticleMeta, data);

// ============================================================================
// Main Transformation Functions
// ============================================================================

/**
 * Transforms FindResult to ArticleDetail
 */
const transformFindResult = (result: FindResult): ArticleDetail => {
  const combined = combineArticleData(result);
  return validateAndParseDetail(combined);
};

/**
 * Transforms MetaResult to ArticleMeta
 */
const transformMetaResult = (result: MetaResult): ArticleMeta => {
  const combined = combineArticleData(result);
  return validateAndParseMeta(combined);
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Transforms database result to domain model
 *
 * This function is polymorphic and returns the appropriate type based
 * on the input type.
 *
 * @param result - DB query result (FindResult or MetaResult)
 * @returns Domain model (ArticleDetail or ArticleMeta)
 *
 * @example
 * ```typescript
 * // With FindResult
 * const findResult: FindResult = await db.query(...);
 * const detail: ArticleDetail = toModel(findResult);
 *
 * // With MetaResult
 * const metaResult: MetaResult = await db.query(...);
 * const meta: ArticleMeta = toModel(metaResult);
 * ```
 */
export const toModel = <T extends MetaResult | FindResult>(
  result: T,
): T extends FindResult ? ArticleDetail : ArticleMeta => {
  // Type narrowing basado en la presencia del campo body
  const isFindResult = "body" in result.article;

  return (
    isFindResult
      ? transformFindResult(result as FindResult)
      : transformMetaResult(result as MetaResult)
  ) as T extends FindResult ? ArticleDetail : ArticleMeta;
};

/**
 * Transforms an array of results to domain models
 *
 * @param results - Array of DB results
 * @returns Array of domain models
 *
 * @example
 * ```typescript
 * const results: MetaResult[] = await db.query(...);
 * const articles: ArticleMeta[] = toModelList(results);
 * ```
 */
export const toModelList = <T extends MetaResult | FindResult>(
  results: ReadonlyArray<T>,
): Array<T extends FindResult ? ArticleDetail : ArticleMeta> =>
  results.map((result) => toModel(result));

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a FindResult from individual values (useful for testing)
 */
export const createFindResult = (params: {
  readonly article: {
    readonly id: number;
    readonly title: string;
    readonly body: string;
  };
  readonly author: {
    readonly id: number | null;
    readonly name: string | null;
  };
  readonly chapter?: {
    readonly id: number;
    readonly title: string;
    readonly order: number;
  };
}): FindResult => ({
  article: params.article,
  author: params.author,
  chapter: params.chapter ?? { id: null, title: null, order: null },
});

/**
 * Creates a MetaResult from individual values (useful for testing)
 */
export const createMetaResult = (params: {
  readonly article: {
    readonly id: number;
    readonly title: string;
  };
  readonly author: {
    readonly id: number | null;
    readonly name: string | null;
  };
  readonly chapter?: {
    readonly id: number;
    readonly title: string;
    readonly order: number;
  };
}): MetaResult => ({
  article: params.article,
  author: params.author,
  chapter: params.chapter ?? { id: null, title: null, order: null },
});
