import type { Lister } from "@articles/domain/index.ts";
import type {
  ArticleListResponse,
  ArticleMeta,
} from "@articles/domain/types/list.ts";
import { UnknownStoreError } from "@shared/domain/interfaces/store.error.ts";
import type { Pagination } from "@shared/domain/types/common";
import { articles, libraryView } from "@shared/infrastructure/store/schema.ts";
import type * as schema from "@shared/infrastructure/store/schema.ts";
import { count, like } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { Err, Ok, type Result } from "result";

const toModel = (result: {
  article: { id: number; title: string };
  author: { id: number | null; name: string | null };
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
}): ArticleMeta => {
  return {
    id: result.article.id,
    title: result.article.title,
    author: {
      name: result.author.name ?? "", // 若为null则采用空字符串
    },
    chapter:
      result.chapter.id !== null
        ? {
            title: result.chapter.title ?? "", // 若为null则采用空字符串
            order: result.chapter.order ?? 0, // 若为null则采用0
          }
        : undefined,
  };
};

// 获取文章列表
export class DrizzleLister implements Lister {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  /**
   * 构造搜索条件，如无关键字则返回 undefined。
   */
  private buildCondition(keyword?: string) {
    const trimmed = keyword?.trim();
    return trimmed ? like(articles.body, `%${trimmed}%`) : undefined;
  }

  /**
   * 构建列表查询。
   * @param condition 过滤条件，可为空
   * @param page 当前分页页码
   * @param size 每页显示的数量
   */
  private buildListQuery(
    condition: ReturnType<typeof this.buildCondition>,
    page: number,
    size: number,
  ) {
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

    // 只在 condition 不为空时应用 where 条件，避免传入 undefined
    return condition ? baseQuery.where(condition) : baseQuery;
  }

  /**
   * 构建统计记录总数的查询。
   * @param condition 过滤条件，可为空
   */
  private buildCountQuery(condition: ReturnType<typeof this.buildCondition>) {
    const baseCountQuery = this.db
      .select({ value: count(articles.id).as("total") })
      .from(articles);

    return condition ? baseCountQuery.where(condition) : baseCountQuery;
  }

  /**
   * 对外提供的主要查询方法，将拆分好的辅助函数组合起来完成逻辑。
   */
  public async findMany(
    query: Pagination & { keyword?: string },
  ): Promise<Result<ArticleListResponse, UnknownStoreError>> {
    try {
      const { page, size, keyword } = query;
      const condition = this.buildCondition(keyword);

      // 1. 查询列表数据
      const listQuery = this.buildListQuery(condition, page, size);
      const rows = await listQuery;
      const list: ArticleMeta[] = rows.map(toModel);

      // 2. 查询总数
      const countQuery = this.buildCountQuery(condition);
      const countResult = await countQuery;
      const totalItems = countResult[0]?.value ?? 0;
      const totalPages = Math.ceil(totalItems / size);

      // 3. 构造并返回
      return Ok({
        data: list,
        pagination: {
          current: page,
          pages: totalPages,
          size,
          items: totalItems,
        },
      });
    } catch (error) {
      return Err(new UnknownStoreError(`未知错误：${String(error)}`));
    }
  }
}
