import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import type { Id } from "src/shared/domain";
import { UnknownStoreError } from "src/shared/domain/interfaces/store.error";
import type { Database } from "src/shared/infrastructure/store/db";
import {
  articles,
  people,
  authors,
  series,
  chapters,
} from "src/shared/infrastructure/store/schema";
import type { ArticleCreate, Saver } from "../../domain";

// ============================================================================
// Pure Functions - Domain Logic
// ============================================================================

/**
 * Creates the article entity and validates the result
 */
const createArticleEntity =
  (trx: Database) =>
  async (data: {
    title: string;
    body: string;
  }): Promise<{ id: Id; title: string; body: string }> => {
    const [article] = await trx
      .insert(articles)
      .values({
        title: data.title.trim(),
        body: data.body.trim(),
      })
      .returning();

    if (!article) {
      throw new UnknownStoreError(
        "Failed to create article: no entity returned",
      );
    }

    return article;
  };

/**
 * Finds or creates a person by name
 */
const findOrCreatePerson =
  (trx: Database) =>
  async (name: string): Promise<{ id: Id; name: string }> => {
    await trx
      .insert(people)
      .values({ name: name.trim() })
      .onConflictDoNothing({ target: people.name });

    const [person] = await trx
      .select({ id: people.id, name: people.name })
      .from(people)
      .where(eq(people.name, name.trim()));

    if (!person) {
      throw new UnknownStoreError(`Failed to find or create person: ${name}`);
    }

    return person;
  };

/**
 * Creates the relationship between article and author
 */
const createAuthorRelation =
  (trx: Database) =>
  async (articleId: Id, personId: Id): Promise<void> => {
    try {
      await trx.insert(authors).values({
        person_id: personId,
        article_id: articleId,
      });
    } catch (error) {
      throw new UnknownStoreError(
        `Failed to create author relation: articleId=${articleId}, personId=${personId}`,
        error instanceof Error ? error : undefined,
      );
    }
  };

/**
 * Associates an author with an article (complete operation)
 */
const associateAuthor =
  (trx: Database) =>
  async (articleId: Id, authorName: string): Promise<void> => {
    const person = await findOrCreatePerson(trx)(authorName);
    await createAuthorRelation(trx)(articleId, person.id);
  };

/**
 * Finds or creates a series by title
 */
const findOrCreateSeries =
  (trx: Database) =>
  async (title: string): Promise<{ id: Id; title: string }> => {
    await trx
      .insert(series)
      .values({ title: title.trim() })
      .onConflictDoNothing({ target: series.title });

    const [seriesEntity] = await trx
      .select({ id: series.id, title: series.title })
      .from(series)
      .where(eq(series.title, title.trim()));

    if (!seriesEntity) {
      throw new UnknownStoreError(`Failed to find or create series: ${title}`);
    }

    return seriesEntity;
  };

/**
 * Creates a chapter associated with an article and series
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
 * Associates a chapter with an article (complete operation)
 */
const associateChapter =
  (trx: Database) =>
  async (
    articleId: Id,
    chapterData: { title: string; order?: number },
  ): Promise<void> => {
    const seriesEntity = await findOrCreateSeries(trx)(chapterData.title);
    await createChapterRelation(trx)(
      articleId,
      seriesEntity.id,
      chapterData.order ?? 1,
    );
  };

// ============================================================================
// Orchestration Functions
// ============================================================================

/**
 * Executes the complete article save transaction
 */
const executeArticleSaveTransaction =
  (db: Database) =>
  async (data: ArticleCreate): Promise<void> => {
    await db.transaction(async (trx) => {
      // 1. Create article
      const article = await createArticleEntity(trx)({
        title: data.title,
        body: data.body,
      });

      // 2. Associate author
      await associateAuthor(trx)(article.id, data.author.name);

      // 3. Associate chapter if exists
      if (data.chapter) {
        await associateChapter(trx)(article.id, data.chapter);
      }
    });
  };

/**
 * Handles errors and converts them to the appropriate type
 */
const handleSaveError = (error: unknown): UnknownStoreError => {
  if (error instanceof UnknownStoreError) {
    return error;
  }

  if (error instanceof Error) {
    return new UnknownStoreError("Failed to create article", error);
  }

  return new UnknownStoreError(
    `Failed to create article with unknown error type: ${String(error)}`,
  );
};

/**
 * Executes the save operation and handles the result
 */
const executeSave =
  (db: Database) =>
  async (data: ArticleCreate): Promise<Result<null, UnknownStoreError>> => {
    try {
      await executeArticleSaveTransaction(db)(data);
      return Ok(null);
    } catch (error) {
      return Err(handleSaveError(error));
    }
  };

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a functional Saver for articles
 */
export const createDrizzleSaver = (db: Database): Saver => ({
  save: executeSave(db),
});

/**
 * Legacy class for backward compatibility
 * @deprecated Use createDrizzleSaver instead
 */
export class DrizzleSaver implements Saver {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  save = (data: ArticleCreate): Promise<Result<null, UnknownStoreError>> => {
    return executeSave(this.#db)(data);
  };
}
