import { eq } from "drizzle-orm";

import { Err, Ok, type Result } from "result";
import type { Finder } from "src/modules/articles/domain";
import type { Id } from "src/shared/domain";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "src/shared/domain/interfaces/store.error";
import type { Database } from "src/shared/infrastructure/store/db";
import { libraryView, series } from "src/shared/infrastructure/store/schema";
import type { ChapterDetail } from "../../domain";

const toModel = (result: {
  article: { id: number | null; title: string | null };
  author: { id: number | null; name: string | null };
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
}) => {
  // Check required fields
  if (result.article.id === null) {
    throw new Error("Article ID cannot be null");
  }
  if (result.article.title === null) {
    throw new Error("Article title cannot be null");
  }
  if (result.author.id === null) {
    throw new Error("Author ID cannot be null");
  }

  return {
    id: result.article.id,
    title: result.article.title,
    author: {
      id: result.author.id,
      name: result.author.name ?? "", // 若为null则采用空字符串
    },
    chapter:
      result.chapter.id !== null
        ? {
            id: result.chapter.id,
            title: result.chapter.title ?? "", // 若为null则采用空字符串
            order: result.chapter.order ?? 0, // 若为null则采用0
          }
        : undefined,
  };
};

// Fetch article list
export class DrizzleFinder implements Finder {
  constructor(private readonly db: Database) {}

  buildListQuery = (id: Id) => {
    return this.db
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
      })
      .from(libraryView)
      .where(eq(libraryView.series_id, id))
      .orderBy(
        libraryView.people_id,
        libraryView.series_id,
        libraryView.chapter_order,
      );
  };

  /**
   * Main query method that combines helper functions to complete the logic.
   */
  find = async (id: Id): Promise<Result<ChapterDetail, UnknownStoreError>> => {
    try {
      // 查找系列信息
      const [chapter] = await this.db
        .select({ id: series.id, title: series.title })
        .from(series)
        .where(eq(series.id, id));

      if (!chapter) {
        return Err(new NotFoundStoreError(`Chapter not found: ${id}`));
      }

      // Get all articles in this series
      const rows = await this.buildListQuery(id);
      const articles = rows.map(toModel);

      return Ok({
        id: chapter.id,
        title: chapter.title,
        articles,
      });
    } catch (error) {
      if (error instanceof Error) {
        return Err(
          new UnknownStoreError(`Unknown error: ${error.message}`, error),
        );
      }
      return Err(new UnknownStoreError(`Unknown error: ${String(error)}`));
    }
  };
}
