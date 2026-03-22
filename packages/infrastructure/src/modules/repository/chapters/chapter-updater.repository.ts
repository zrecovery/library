import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ChapterUpdaterRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  Update = async (data: {
    articleId: number;
    title: string;
    order: number;
  }): Promise<Result<number, TaggedError<"Unknown Error">>> => {
    const existingChapter = await this.#db
      .select({ id: schema.chapters.id })
      .from(schema.chapters)
      .where(eq(schema.chapters.articleId, data.articleId))
      .limit(1);

    if (!existingChapter[0]) {
      const [series] = await this.#db
        .insert(schema.series)
        .values({ title: data.title })
        .onConflictDoNothing()
        .returning({ insertedId: schema.series.id });

      let seriesId = series?.insertedId;
      if (!seriesId) {
        const existingSeries = await this.#db
          .select({ id: schema.series.id })
          .from(schema.series)
          .where(sql`${schema.series.title} = ${data.title}`)
          .limit(1);
        if (!existingSeries[0]) {
          return Err(
            new TaggedError("Unknown Error", "Unknown Error" as const),
          );
        }
        seriesId = existingSeries[0].id;
      }

      const [chapter] = await this.#db
        .insert(schema.chapters)
        .values({ articleId: data.articleId, seriesId, order: data.order })
        .returning({ insertedId: schema.chapters.id });

      if (!chapter) {
        return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
      }

      return Ok(chapter.insertedId);
    }

    const chapterId = existingChapter[0].id;
    const chapter = await this.#db
      .select({ seriesId: schema.chapters.seriesId })
      .from(schema.chapters)
      .where(eq(schema.chapters.id, chapterId))
      .limit(1);

    if (!chapter[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const [series] = await this.#db
      .insert(schema.series)
      .values({ title: data.title })
      .onConflictDoNothing()
      .returning({ insertedId: schema.series.id });

    let newSeriesId = series?.insertedId;
    if (!newSeriesId) {
      const existingSeries = await this.#db
        .select({ id: schema.series.id })
        .from(schema.series)
        .where(sql`${schema.series.title} = ${data.title}`)
        .limit(1);
      if (!existingSeries[0]) {
        return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
      }
      newSeriesId = existingSeries[0].id;
    }

    const [updated] = await this.#db
      .update(schema.chapters)
      .set({
        seriesId: newSeriesId,
        order: data.order,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.chapters.id, chapterId))
      .returning({ updatedId: schema.chapters.id });

    if (!updated) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    return Ok(updated.updatedId);
  };
}
