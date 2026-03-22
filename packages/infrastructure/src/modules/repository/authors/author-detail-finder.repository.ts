import type { Database } from "@shared/db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { TaggedError } from "tag-error";

export class AuthorDetailFinderRepository {
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
        name: string;
        articles: Array<{ id: number; title: string }>;
      },
      TaggedError<"Not Found" | "Unknown Error">
    >
  > => {
    const author = await this.#db
      .select({
        id: schema.authors.id,
        personId: schema.authors.personId,
      })
      .from(schema.authors)
      .where(eq(schema.authors.id, id))
      .limit(1);

    if (!author[0]) {
      return Err(new TaggedError("Not Found", "Not Found" as const));
    }

    const person = await this.#db
      .select({ name: schema.people.name })
      .from(schema.people)
      .where(eq(schema.people.id, author[0].personId))
      .limit(1);

    if (!person[0]) {
      return Err(new TaggedError("Unknown Error", "Unknown Error" as const));
    }

    const articles = await this.#db
      .select({
        id: schema.articles.id,
        title: schema.articles.title,
      })
      .from(schema.articles)
      .innerJoin(
        schema.authors,
        eq(schema.articles.id, schema.authors.articleId),
      )
      .where(eq(schema.authors.id, id));

    return Ok({
      id: author[0].id,
      name: person[0].name,
      articles,
    });
  };
}
