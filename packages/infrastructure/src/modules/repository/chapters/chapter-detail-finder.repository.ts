import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class ChapterDetailFinderRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  findDetailById = async (
    id: number,
  ): Promise<
    Result<
      {
        id: number;
        title: string;
        order: number;
        articles: Array<{ id: number; title: string }>;
      },
      TaggedError<"Not Found" | "Unknown Error">
    >
  > => {
    const chapter = await this.#db
      .select({
        id: schema.chapters.id,
        seriesId: schema.chapters.seriesId,
        order: schema.chapters.order,
      })
      .from(schema.chapters)
      .where(eq(schema.chapters.id, id))
      .limit(1);

    if (!chapter[0]) {
      return Err(new TaggedError("Not Found", "Not Found" as const));
    }

    const series = await this.#db
      .select({ title: schema.series.title })
      .from(schema.series)
      .where(eq(schema.series.id, chapter[0].seriesId))
      .limit(1);

    if (!series[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const articles = await this.#db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
      })
      .from(schema.articles)
      .innerJoin(
        schema.chapters,
        eq(schema.articles.id, schema.chapters.articleId),
      )
      .where(eq(schema.chapters.id, id));

    return Ok({
      id: chapter[0].id,
      title: series[0].title,
      order: chapter[0].order,
      articles,
    });
  };
}
