import type { Finder } from "@chapters/domain/interfaces/store/find";
import type { ChapterDetail } from "@chapters/domain/types";
import type { Id } from "@shared/domain";
import {
  NotFoundStoreError,
  UnknownStoreError,
} from "@shared/domain/interfaces/store.error";
import type { Database } from "@shared/infrastructure/store/db";
import { libraryView, series } from "@shared/infrastructure/store/schema";
import { eq } from "drizzle-orm";

import { Err, Ok, type Result } from "result";

const toModel = (result: {
  article: { id: number | null; title: string | null };
  author: { id: number | null; name: string | null };
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
}) => {
  // 检查必要的字段
  if (result.article.id === null) {
    throw new Error("文章ID不能为空");
  }
  if (result.article.title === null) {
    throw new Error("文章标题不能为空");
  }
  if (result.author.id === null) {
    throw new Error("作者ID不能为空");
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

// 获取文章列表
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
   * 对外提供的主要查询方法，将拆分好的辅助函数组合起来完成逻辑。
   */
  find = async (id: Id): Promise<Result<ChapterDetail, UnknownStoreError>> => {
    try {
      // 查找系列信息
      const [chapter] = await this.db
        .select({ id: series.id, title: series.title })
        .from(series)
        .where(eq(series.id, id));

      if (!chapter) {
        return Err(new NotFoundStoreError(`未找到章节：${id}`));
      }

      // 获取该系列下的所有文章
      const rows = await this.buildListQuery(id);
      const articles = rows.map(toModel);

      return Ok({
        id: chapter.id,
        title: chapter.title,
        articles,
      });
    } catch (error) {
      if (error instanceof Error) {
        return Err(new UnknownStoreError(`未知错误：${error.message}`, error));
      }
      return Err(new UnknownStoreError(`未知错误：${String(error)}`));
    }
  };
}