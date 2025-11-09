import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import type { Id } from "src/shared/domain";
import {
  UnknownStoreError,
  NotFoundStoreError,
  StoreError,
} from "src/shared/domain/interfaces/store.error";
import type { Database } from "src/shared/infrastructure/store/db";
import {
  articles,
  authors,
  chapters,
  people,
  series,
} from "src/shared/infrastructure/store/schema";
import type { Updater } from "../../domain";

// ============================================================================
// Types
// ============================================================================

type UpdateData = {
  readonly title?: string;
  readonly body?: string;
  readonly author?: Partial<{ name: string }>;
  readonly chapter?: Partial<{ title: string; order: number }>;
};

type ArticleFields = {
  readonly title?: string;
  readonly body?: string;
};

// ============================================================================
// Pure Functions - Data Validation
// ============================================================================

/**
 * Checks if there are article fields to update
 */
const hasArticleFieldsToUpdate = (data: UpdateData): boolean =>
  data.title !== undefined || data.body !== undefined;

/**
 * Extracts article fields for update
 */
const extractArticleFields = (data: UpdateData): ArticleFields => ({
  title: data.title,
  body: data.body,
});

/**
 * Checks if there is author information to update
 */
const hasAuthorToUpdate = (data: UpdateData): boolean =>
  data.author?.name !== undefined && data.author.name.trim().length > 0;

/**
 * Checks if there is chapter information to update
 */
const hasChapterToUpdate = (data: UpdateData): boolean =>
  data.chapter !== undefined &&
  (data.chapter.title !== undefined || data.chapter.order !== undefined);

// ============================================================================
// Database Operations - Article
// ============================================================================

/**
 * Verifies if an article exists by ID
 */
const verifyArticleExists =
  (trx: Database) =>
  async (id: Id): Promise<boolean> => {
    const [existingArticle] = await trx
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, id));

    return existingArticle !== undefined;
  };

/**
 * Updates the basic article fields
 */
const updateArticleFields =
  (trx: Database) =>
  async (id: Id, fields: ArticleFields): Promise<void> => {
    await trx.update(articles).set(fields).where(eq(articles.id, id));
  };

// ============================================================================
// Database Operations - Person & Author
// ============================================================================

/**
 * Finds or creates a person by name
 */
const findOrCreatePerson =
  (trx: Database) =>
  async (name: string): Promise<{ id: Id; name: string }> => {
    const trimmedName = name.trim();

    await trx
      .insert(people)
      .values({ name: trimmedName })
      .onConflictDoNothing({ target: people.name });

    const [person] = await trx
      .select({ id: people.id, name: people.name })
      .from(people)
      .where(eq(people.name, trimmedName));

    if (!person) {
      throw new UnknownStoreError(`Failed to find or create person: ${name}`);
    }

    return person;
  };

/**
 * Finds an existing author relationship
 */
const findExistingAuthor =
  (trx: Database) =>
  async (articleId: Id): Promise<{ id: number } | null> => {
    const [existingAuthor] = await trx
      .select({ id: authors.id })
      .from(authors)
      .where(eq(authors.article_id, articleId));

    return existingAuthor ?? null;
  };

/**
 * Updates an existing author relationship
 */
const updateAuthorRelation =
  (trx: Database) =>
  async (authorId: number, personId: Id): Promise<void> => {
    await trx
      .update(authors)
      .set({ person_id: personId })
      .where(eq(authors.id, authorId));
  };

/**
 * Creates a new author relationship
 */
const createAuthorRelation =
  (trx: Database) =>
  async (articleId: Id, personId: Id): Promise<void> => {
    await trx
      .insert(authors)
      .values({ person_id: personId, article_id: articleId });
  };

/**
 * Updates or creates the complete author relationship
 */
const upsertAuthorRelation =
  (trx: Database) =>
  async (articleId: Id, authorName: string): Promise<void> => {
    const person = await findOrCreatePerson(trx)(authorName);
    const existingAuthor = await findExistingAuthor(trx)(articleId);

    if (existingAuthor) {
      await updateAuthorRelation(trx)(existingAuthor.id, person.id);
    } else {
      await createAuthorRelation(trx)(articleId, person.id);
    }
  };

// ============================================================================
// Database Operations - Series & Chapter
// ============================================================================

/**
 * Finds or creates a series by title
 */
const findOrCreateSeries =
  (trx: Database) =>
  async (title: string): Promise<{ id: Id; title: string }> => {
    const trimmedTitle = title.trim();

    await trx
      .insert(series)
      .values({ title: trimmedTitle })
      .onConflictDoNothing({ target: series.title });

    const [seriesEntity] = await trx
      .select({ id: series.id, title: series.title })
      .from(series)
      .where(eq(series.title, trimmedTitle));

    if (!seriesEntity) {
      throw new UnknownStoreError(`Failed to find or create series: ${title}`);
    }

    return seriesEntity;
  };

/**
 * Finds an existing chapter
 */
const findExistingChapter =
  (trx: Database) =>
  async (articleId: Id): Promise<{ id: number } | null> => {
    const [existingChapter] = await trx
      .select({ id: chapters.id })
      .from(chapters)
      .where(eq(chapters.article_id, articleId));

    return existingChapter ?? null;
  };

/**
 * Updates an existing chapter
 */
const updateChapterRelation =
  (trx: Database) =>
  async (chapterId: number, seriesId: Id, order: number): Promise<void> => {
    await trx
      .update(chapters)
      .set({ series_id: seriesId, order })
      .where(eq(chapters.id, chapterId));
  };

/**
 * Creates a new chapter relationship
 */
const createChapterRelation =
  (trx: Database) =>
  async (articleId: Id, seriesId: Id, order: number): Promise<void> => {
    await trx.insert(chapters).values({
      article_id: articleId,
      series_id: seriesId,
      order,
    });
  };

/**
 * Updates only the chapter order
 */
const updateChapterOrder =
  (trx: Database) =>
  async (articleId: Id, order: number): Promise<void> => {
    await trx
      .update(chapters)
      .set({ order })
      .where(eq(chapters.article_id, articleId));
  };

/**
 * Updates or creates the chapter relationship with title and order
 */
const upsertChapterWithTitle =
  (trx: Database) =>
  async (articleId: Id, title: string, order: number): Promise<void> => {
    const seriesEntity = await findOrCreateSeries(trx)(title);
    const existingChapter = await findExistingChapter(trx)(articleId);

    if (existingChapter) {
      await updateChapterRelation(trx)(
        existingChapter.id,
        seriesEntity.id,
        order,
      );
    } else {
      await createChapterRelation(trx)(articleId, seriesEntity.id, order);
    }
  };

/**
 * Handles chapter update based on available data
 */
const handleChapterUpdate =
  (trx: Database) =>
  async (
    articleId: Id,
    chapterData: Partial<{ title: string; order: number }>,
  ): Promise<void> => {
    if (chapterData.title) {
      const order = chapterData.order ?? 1;
      await upsertChapterWithTitle(trx)(articleId, chapterData.title, order);
    } else if (chapterData.order !== undefined) {
      await updateChapterOrder(trx)(articleId, chapterData.order);
    }
  };

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes all updates within a transaction
 */
const executeUpdateTransaction =
  (db: Database) =>
  async (id: Id, data: UpdateData): Promise<void> => {
    await db.transaction(async (trx) => {
      // 1. Verify article existence
      const exists = await verifyArticleExists(trx)(id);
      if (!exists) {
        throw new NotFoundStoreError(`Article not found: ${id}`);
      }

      // 2. Update basic article fields
      if (hasArticleFieldsToUpdate(data)) {
        const fields = extractArticleFields(data);
        await updateArticleFields(trx)(id, fields);
      }

      // 3. Update author if exists
      if (hasAuthorToUpdate(data)) {
        await upsertAuthorRelation(trx)(id, data.author!.name!);
      }

      // 4. Update chapter if exists
      if (hasChapterToUpdate(data)) {
        await handleChapterUpdate(trx)(id, data.chapter!);
      }
    });
  };

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Classifies and handles store errors
 */
const handleUpdateError = (
  error: unknown,
): NotFoundStoreError | UnknownStoreError => {
  if (error instanceof NotFoundStoreError) {
    return error;
  }

  if (error instanceof StoreError) {
    return new UnknownStoreError(error.message, error);
  }

  if (error instanceof Error) {
    return new UnknownStoreError(error.message, error);
  }

  return new UnknownStoreError(`Unknown error: ${String(error)}`);
};

// ============================================================================
// Main Update Function
// ============================================================================

/**
 * Executes the update and returns the result
 */
const executeUpdate =
  (db: Database) =>
  async (
    id: Id,
    data: UpdateData,
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>> => {
    try {
      await executeUpdateTransaction(db)(id, data);
      return Ok(null);
    } catch (error) {
      return Err(handleUpdateError(error));
    }
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a functional Updater for articles
 */
export const createDrizzleUpdater = (db: Database): Updater => ({
  update: executeUpdate(db),
});

/**
 * Legacy class for backward compatibility
 * @deprecated Use createDrizzleUpdater instead
 */
export class DrizzleUpdater implements Updater {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  update = (
    id: Id,
    data: UpdateData,
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>> => {
    return executeUpdate(this.#db)(id, data);
  };
}
