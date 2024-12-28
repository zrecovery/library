import type { AuthorDetail } from "@author/domain/types/detail";
import * as schema from "@shared/infrastructure/store/schema";
import {
  StoreError,
  StoreErrorType,
} from "@shared/infrastructure/store/store.error";
import { and, eq, isNotNull } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Id } from "src/model";
import { toAuthorModel, toChapterMetaModel, toModel } from "./dto";

export const find =
  (db: PostgresJsDatabase<typeof schema>) =>
  async (id: Id): Promise<AuthorDetail> => {
    const result = await db
      .select({
        id: schema.authors.id,
        name: schema.people.name,
      })
      .from(schema.authors)
      .leftJoin(schema.people, eq(schema.authors.person_id, schema.people.id))
      .where(eq(schema.people.id, id));

    if (result.length === 0) {
      throw new StoreError("Author not found", StoreErrorType.NotFound);
    }

    if (result.length > 1) {
      throw new StoreError(
        "Multiple authors found",
        StoreErrorType.DuplicateEntry,
      );
    }

    const articles = (
      await db
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
    ).map(toModel);

    const chapters = (
      await db
        .select({
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
        )
    )
      .map(toChapterMetaModel)
      .filter((c) => c !== undefined);

    const author = result.map(toAuthorModel).filter((a) => a !== undefined);
    return {
      ...author[0],
      articles,
      chapters,
    };
  };
