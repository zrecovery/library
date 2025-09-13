import type { AuthorDetail } from "@authors/domain/types";
import { type Id, IdSchema } from "@shared/domain";
import {
  NotFoundStoreError,
  type UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import { AuthorSchema } from "@shared/domain/types/author";
import { ChapterSchema } from "@shared/domain/types/chapter";
import type { Database } from "@shared/infrastructure/store/db";
import * as schema from "@shared/infrastructure/store/schema";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { and, eq, isNotNull } from "drizzle-orm";
import { Err, Ok, type Result } from "result";
import { toAuthorModel, toChapterMetaModel } from "./dto";

type Entity = {
  article: { id: number | null; title: string | null };
  author: { id: number | null; name: string | null };
  chapter: { id: number | null; title: string | null; order: number | null };
};

export class Finder {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  #toModel = (entity: Entity) => {
    const article = Value.Parse(
      Type.Composite([IdSchema, Type.Object({ title: Type.String() })]),
      entity.article,
    );
    const author = Value.Parse(
      Type.Composite([IdSchema, AuthorSchema]),
      entity.author,
    );
    const chapter =
      entity.chapter.id !== null
        ? Value.Parse(Type.Composite([IdSchema, ChapterSchema]), entity.chapter)
        : undefined;
    return {
      ...article,
      author,
      chapter,
    };
  };

  #findArticles = async (id: Id) => {
    const articles = (
      await this.#db
        .select({
          article: {
            id: schema.libraryView.id,
            title: schema.libraryView.title,
          },
          author: {
            id: schema.libraryView.people_id,
            name: schema.libraryView.people_name,
          },
          chapter: {
            id: schema.libraryView.series_id,
            title: schema.libraryView.series_title,
            order: schema.libraryView.chapter_order,
          },
        })
        .from(schema.libraryView)
        .where(eq(schema.libraryView.people_id, id))
    ).map(this.#toModel);
    return articles;
  };

  #findChapter = async (id: Id) => {
    const result = await this.#db
      .selectDistinct({
        id: schema.libraryView.series_id,
        title: schema.libraryView.series_title,
      })
      .from(schema.libraryView)
      .where(
        and(
          eq(schema.libraryView.people_id, id),
          isNotNull(schema.libraryView.series_title),
          isNotNull(schema.libraryView.series_id),
        ),
      );

    return result.map(toChapterMetaModel).filter((c) => c !== undefined);
  };

  find = async (
    id: Id,
  ): Promise<Result<AuthorDetail, NotFoundStoreError | UnknownStoreError>> => {
    // 通过 people.id 查找作者
    const result = await this.#db
      .select({
        id: schema.people.id,
        name: schema.people.name,
      })
      .from(schema.people)
      .where(eq(schema.people.id, id));

    if (result.length === 0) {
      return Err(new NotFoundStoreError(`Not found author, id is ${id}`));
    }

    const author = toAuthorModel(result[0]);
    if (!author) {
      return Err(new UnknownStoreError(`Invalid author data for id: ${id}`));
    }

    const chapters = await this.#findChapter(id);
    const articles = await this.#findArticles(id);
    
    return Ok({
      ...author,
      articles,
      chapters,
    });
  };
}