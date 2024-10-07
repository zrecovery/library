import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ArticleDetail, Id } from "../../domain/model";
import { articles, authors, chapters, people, series } from "../scheme";
import { StoreError, StoreErrorType } from "../store.error";

export const find =
  (db: PostgresJsDatabase) =>
  async (id: Id): Promise<ArticleDetail | null> => {
    const result = await db
      .select()
      .from(articles)
      .innerJoin(authors, eq(authors.article_id, articles.id))
      .innerJoin(people, eq(authors.person_id, people.id))
      .innerJoin(chapters, eq(chapters.article_id, articles.id))
      .innerJoin(series, eq(chapters.series_id, series.id))
      .where(eq(articles.id, id));

    if (result.length === 0) {
      return null;
    }

    if (result.length !== 1) {
      throw new StoreError("内部存在脏数据", StoreErrorType.NotFound);
    }

    const article = result.map((r) => {
      if (r.chapters.id === null) {
        return {
          ...r.articles,
          author: {
            ...r.people,
          },
          chapter: {
            ...r.series,
            order: r.chapters.order,
          },
        };
      }
      return {
        ...r.articles,
        author: {
          ...r.people,
        },
        chapter: {
          ...r.series,
          order: r.chapters.order,
        },
      };
    })[0];

    return article;
  };
