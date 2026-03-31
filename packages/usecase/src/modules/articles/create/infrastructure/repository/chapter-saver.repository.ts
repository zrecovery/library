import { sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";
import type { Transaction } from "@shared/infrastructure/repostiory/db";
import * as schema from "@shared/infrastructure/repostiory/schema";
import type { ChapterSaver } from "@articles/create/port/deps/ChapterSaver";
export class ChapterSaverRepository implements ChapterSaver {
  #tx: Transaction;
  constructor(tx: Transaction) {
    this.#tx = tx;
  }
  rollback = () => {
    this.#tx.rollback();
  };
  save = async (data: {
    articleId: number;
    title: string;
    order: number;
  }): Promise<Result<number, TaggedError<"Unknown Error">>> => {
    const [series] = await this.#tx
      .insert(schema.series)
      .values({ title: data.title })
      .onConflictDoNothing()
      .returning({ insertedId: schema.series.id });
    const seriesId = series?.insertedId;
    if (!seriesId) {
      const existingSeries = await this.#tx
        .select({ id: schema.series.id })
        .from(schema.series)
        .where(sql`${schema.series.title} = ${data.title}`)
        .limit(1);
      if (!existingSeries[0]) {
        return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
      }
      const seriesIdValue = existingSeries[0].id;
      const [chapter] = await this.#tx
        .insert(schema.chapters)
        .values({
          articleId: data.articleId,
          seriesId: seriesIdValue,
          order: data.order,
        })
        .returning({ insertedId: schema.chapters.id });
      const insertedId = chapter?.insertedId;
      if (!insertedId) {
        return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
      }
      return Ok(insertedId);
    }
    const [chapter] = await this.#tx
      .insert(schema.chapters)
      .values({ articleId: data.articleId, seriesId, order: data.order })
      .returning({ insertedId: schema.chapters.id });
    const insertedId = chapter?.insertedId;
    if (!insertedId) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }
    return Ok(insertedId);
  };
}
