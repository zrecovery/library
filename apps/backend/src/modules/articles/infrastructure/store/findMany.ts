import type { Lister } from "@articles/domain/index.ts";
import type {
  ArticleListResponse,
  ArticleMeta,
} from "@articles/domain/types/list.ts";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error.ts";
import type { Pagination } from "@shared/domain/types/common";
import type { Database } from "@shared/infrastructure/store/db";
import { articles, libraryView } from "@shared/infrastructure/store/schema.ts";
import { type SQL, count, like } from "drizzle-orm";
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
   * 构造搜索条件，如无关键字则返回 undefined。
   */
  #buildCondition = (keyword?: string): SQL | undefined => {
    const trimmed = keyword?.trim();
    return trimmed ? like(articles.body, `%${trimmed}%`) : undefined;
  };

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

  /**
   * 构建统计记录总数的查询。
   * @param condition 过滤条件，可为空
   */
  #buildCountQuery = (condition: ReturnType<Condition>) => {
    return this.db
      .select({ value: count(libraryView.id).as("total") })
      .from(libraryView)
      .where(condition);
  };

  /**
   * 对外提供的主要查询方法，将拆分好的辅助函数组合起来完成逻辑。
   */
  findMany = async (
    query: Pagination & { keyword?: string },
  ): Promise<Result<ArticleListResponse, UnknownStoreError>> => {
    const { page, size, keyword } = query;
    const trimmed = keyword?.trim();
    const condition = trimmed ? like(libraryView.body, `%${trimmed}%`) : undefined;
    console.log(keyword)
    try {
      // 1. 查询列表数据
      const listQuery = this.#buildListQuery(page, size, condition);
      const rows = await listQuery;
      const list: ArticleMeta[] = rows.map(toModel);

      // 2. 查询总数
      const countQuery = this.#buildCountQuery(condition);
      const countResult = await countQuery;
      const totalItems = countResult[0]?.value ?? 0;
      const totalPages = Math.ceil(totalItems / (size ?? 10));

      // 3. 构造并返回
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
      console.error(error);
      return Err(new UnknownStoreError(`未知错误：${String(error)}`));
    }
  };
}
