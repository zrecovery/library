import type { ArticleDetail } from "@article/domain/types/detail.ts";
import {
  StoreError,
  StoreErrorType,
} from "@shared/infrastructure/store/store.error.ts";
import type { ArticleMeta } from "@article/domain/types/list.ts";

export type FindResult = {
  article: { id: number; title: string; body: string };
  author: { id: number; name: string } | null;
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
};

export type MetaResult = {
  article: { id: number; title: string };
  author: { id: number; name: string } | null;
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
};

export const toModel = <T extends MetaResult | FindResult>(
  r: T,
): T extends FindResult ? ArticleDetail : ArticleMeta => {
  if (!r.author) {
    throw new StoreError(
      `脏数据：缺少author，article_id=${r.article.id}`,
      StoreErrorType.ValidationError,
    );
  }
  const chapter =
    r.chapter.id && r.chapter.order && r.chapter.title
      ? {
          id: r.chapter.id,
          order: r.chapter.order,
          title: r.chapter.title,
        }
      : undefined;

  // @ts-ignore
  // 注意：此处Typescript语法检查没法判断 body在不同输入类型下的对应输出类型，须人工形式化证明。
  return {
    ...r.article,
    author: r.author,
    chapter: chapter,
  };
};
