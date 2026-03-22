import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { and, desc, gte, like, lte, or, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import type { TaggedError } from "tag-error";

export class ArticleListFinderRepository {
  #db: Database;
  constructor(readonly db: Database) {
    this.#db = db;
  }
  find = async (
    pagination: { page: number; size: number },
    keywords?: { positive: string[]; negative: string[] },
  ): Promise<
    Result<
      {
        pagination: {
          pages: number;
          items: number;
          current: number;
          size: number;
        };
        data: Array<{
          id: number;
          title: string;
          chapter?: { id: number; title: string; order: number };
          author: { id: number; name: string };
        }>;
      },
      TaggedError<"Not Found" | "Unknown Error">
    >
  > => {
    const offset = (pagination.page - 1) * pagination.size;

    let whereCondition;
    if (keywords && keywords.positive.length > 0) {
      const positiveConditions = keywords.positive.map((k) =>
        like(schema.articles.title, `%${k}%`),
      );
      whereCondition = and(...positiveConditions);
    }

    const articles = await this.#db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
      })
      .from(schema.articles)
      .where(whereCondition)
      .limit(pagination.size)
      .offset(offset);

    const items = articles.length;
    const totalItems = items;
    const pages = Math.ceil(totalItems / pagination.size);

    const data = await Promise.all(
      articles.map(async (article) => {
        const author = await this.#db
          .select({
            id: schema.authors.id,
            name: schema.people.name,
          })
          .from(schema.authors)
          .innerJoin(
            schema.people,
            sql`${schema.authors.personId} = ${schema.people.id}`,
          )
          .where(sql`${schema.authors.articleId} = ${article.id}`)
          .limit(1);

        const chapter = await this.#db
          .select({
            id: schema.chapters.id,
            title: schema.series.title,
            order: schema.chapters.order,
          })
          .from(schema.chapters)
          .innerJoin(
            schema.series,
            sql`${schema.chapters.seriesId} = ${schema.series.id}`,
          )
          .where(sql`${schema.chapters.articleId} = ${article.id}`)
          .limit(1);

        return {
          id: article.id,
          title: article.title,
          author: author[0] || { id: 0, name: "" },
          chapter: chapter[0] ? { ...chapter[0] } : undefined,
        };
      }),
    );

    return Ok({
      pagination: {
        pages,
        items: totalItems,
        current: pagination.page,
        size: pagination.size,
      },
      data,
    });
  };
}
