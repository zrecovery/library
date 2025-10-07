import type { Lister } from "@articles/domain/index.ts";
import type {
  ArticleListResponse,
  ArticleMeta,
} from "@articles/domain/types/list.ts";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error.ts";
import type { Pagination } from "@shared/domain/types/common";
import type { Database } from "@shared/infrastructure/store/db";
import { libraryView } from "@shared/infrastructure/store/schema.ts";
import { type SQL, sql } from "drizzle-orm";
import { Err, Ok, type Result } from "result";

export const spliteKeyword = (keyword: string): string[] => keyword.split("|");

const toModel = (result: {
  article: { id: number | null; title: string | null };
  author: { id: number | null; name: string | null };
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
}): ArticleMeta => {
  if (result.article.id === null) {
    throw new Error("文章ID不能为空");
  }
  if (result.article.title === null) {
    throw new Error("文章标题不能为空");
  }
  return {
    id: result.article.id,
    title: result.article.title,
    author: {
      id: result.author.id ?? 0,
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

type Condition = (keyword?: string) => SQL | undefined;

// 获取文章列表
export class DrizzleLister implements Lister {
  constructor(private readonly db: Database) {}

  /**
   * 构建列表查询。
   * @param condition 过滤条件，可为空
   * @param page 当前分页页码
   * @param size 每页显示的数量
   */
  #buildListQuery = (
    page: number,
    size: number,
    condition: ReturnType<Condition>,
  ) => {
    const offset = (page - 1) * size;

    const baseQuery = this.db
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
        total: sql<number>`count(*) OVER()`,
      })
      .from(libraryView)
      .orderBy(
        libraryView.people_id,
        libraryView.series_id,
        libraryView.chapter_order,
      )
      .limit(size)
      .offset(offset);

    return baseQuery.where(condition);
  };

  #keywordHandler = (
    keyword: string,
  ): { positive: string[]; negative: string[] } => {
    const trimmed = keyword.trim();
    const sp = trimmed.split(" ");
    const positive = sp.filter((s) => s.startsWith("+")).map((s) => s.slice(1));
    const negative = sp.filter((s) => s.startsWith("-")).map((s) => s.slice(1));
    return { positive, negative };
  };

  #buildCondition = (keyword: string) => {
    const { positive, negative } = this.#keywordHandler(keyword);
    if (!positive.length && !negative.length) return undefined;
    const query =
      positive.reduce((acc, cur) => `${acc}  ${cur}`, "") +
      negative.reduce((acc, cur) => `${acc}  -${cur}`, "");
    const condition = sql`${libraryView.body} &@~ ${query.trim()}`;
    return condition;
  };
  /**
   * 对外提供的主要查询方法，将拆分好的辅助函数组合起来完成逻辑。
   */
  findMany = async (
    query: Pagination & { keyword?: string },
  ): Promise<Result<ArticleListResponse, UnknownStoreError>> => {
    const { page, size, keyword } = query;

    const condition = keyword ? this.#buildCondition(keyword) : undefined;
    try {
      // 1. 查询列表数据
      const listQuery = this.#buildListQuery(page, size, condition);

      const rows = await listQuery;
      const list: ArticleMeta[] = rows.map(toModel);

      const totalItems = Number(rows[0].total);
      const totalPages = Math.ceil(totalItems / size);

      // 2. 构造并返回
      return Ok({
        data: list,
        pagination: {
          current: page,
          pages: totalPages,
          size: size,
          items: totalItems,
        },
      });
    } catch (error) {
      return Err(new UnknownStoreError(`未知错误：${String(error)}`));
    }
  };
}
