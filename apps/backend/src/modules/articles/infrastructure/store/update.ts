import type { Updater } from "@articles/domain";
import { type Id, UnknownError } from "@shared/domain";
import {
  NotFoundStoreError,
  StoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Database } from "@shared/infrastructure/store/db";
import {
  articles,
  authors,
  chapters,
  libraryView,
  people,
  series,
} from "@shared/infrastructure/store/schema.ts";
import { eq } from "drizzle-orm";

import { Err, Ok, type Result } from "result";

type viewResult = {
  id: number;
  title: string;
  series_id: number | null;
  chapter_id: number | null;
  chapter_order: number | null;
  series_title: string | null;
  author_id: number | null;
  people_id: number | null;
  people_name: string | null;
};

export class DrizzleUpdater implements Updater {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  #updateAuthorRelated =
    (trx: Database) =>
    async (articleId: Id, author: { name: string }) => {
      // 查找或创建作者
      await trx
        .insert(people)
        .values({ name: author.name.trim() })
        .onConflictDoNothing({ target: people.name });

      const [person] = await trx
        .select({ id: people.id })
        .from(people)
        .where(eq(people.name, author.name.trim()));

      if (!person) {
        throw new UnknownStoreError(`Failed to find or create person: ${author.name}`);
      }

      // 查找是否已存在作者关联
      const [existingAuthor] = await trx
        .select({ id: authors.id })
        .from(authors)
        .where(eq(authors.article_id, articleId));

      if (existingAuthor) {
        // 更新现有作者关联
        await trx
          .update(authors)
          .set({ person_id: person.id })
          .where(eq(authors.id, existingAuthor.id));
      } else {
        // 创建新的作者关联
        await trx
          .insert(authors)
          .values({ person_id: person.id, article_id: articleId });
      }
    };

  update = async (
    id: Id,
    data: {
      title?: string;
      body?: string;
      author?: Partial<{ name: string }>;
      chapter?: Partial<{ title: string; order: number }>;
    },
  ): Promise<Result<null, NotFoundStoreError | UnknownStoreError>> => {
    try {
      await this.#db.transaction(async (trx) => {
        // 检查文章是否存在
        const [existingArticle] = await trx
          .select({ id: articles.id })
          .from(articles)
          .where(eq(articles.id, id));

        if (!existingArticle) {
          throw new NotFoundStoreError(`Article not found: ${id}`);
        }

        // 更新文章标题和内容
        const { title, body, author, chapter } = data;
        if (title || body) {
          await trx
            .update(articles)
            .set({ title, body })
            .where(eq(articles.id, id));
        }

        // 更新作者信息
        if (author?.name) {
          await this.#updateAuthorRelated(trx)(id, { name: author.name });
        }

        // 更新章节信息
        if (chapter) {
          // 查找或创建系列
          if (chapter.title) {
            await trx
              .insert(series)
              .values({ title: chapter.title.trim() })
              .onConflictDoNothing({ target: series.title });

            const [s] = await trx
              .select({ id: series.id })
              .from(series)
              .where(eq(series.title, chapter.title.trim()));

            if (!s) {
              throw new UnknownStoreError(`Failed to find or create series: ${chapter.title}`);
            }

            // 查找是否已存在章节关联
            const [existingChapter] = await trx
              .select({ id: chapters.id })
              .from(chapters)
              .where(eq(chapters.article_id, id));

            if (existingChapter) {
              // 更新现有章节关联
              await trx
                .update(chapters)
                .set({
                  series_id: s.id,
                  order: chapter.order ?? 1
                })
                .where(eq(chapters.id, existingChapter.id));
            } else {
              // 创建新的章节关联
              await trx
                .insert(chapters)
                .values({
                  article_id: id,
                  series_id: s.id,
                  order: chapter.order ?? 1
                });
            }
          } else if (chapter.order !== undefined) {
            // 只更新章节顺序
            await trx
              .update(chapters)
              .set({ order: chapter.order })
              .where(eq(chapters.article_id, id));
          }
        }
      });
      return Ok(null);
    } catch (e) {
      if (e instanceof StoreError) {
        if (e instanceof NotFoundStoreError) {
          return Err(e);
        }
        return Err(new UnknownStoreError(e.message, e));
      }
      if (e instanceof Error) {
        return Err(new UnknownStoreError(e.message, e));
      }
      return Err(new UnknownStoreError(`Unknown error: ${e}`));
    }
  };
}
