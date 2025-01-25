import { ArticleDetail } from "@articles/domain/types/detail.ts";
import type { ArticleMeta } from "@articles/domain/types/list.ts";
import { Value } from "@sinclair/typebox/value";

export type FindResult = {
  article: { id: number | null; title: string | null; body: string | null };
  author: { id: number | null; name: string | null };
  chapter: { id: number | null; title: string | null; order: number | null };
};

export type MetaResult = {
  article: { id: number; title: string };
  author: { id: number | null; name: string | null };
  chapter: {
    id: number | null;
    title: string | null;
    order: number | null;
  };
};

export const toModel = <T extends MetaResult | FindResult>(
  r: T,
): T extends FindResult ? ArticleDetail : ArticleMeta => {
  const chapter =
    r.chapter.id && r.chapter.order && r.chapter.title
      ? {
          id: r.chapter.id,
          order: r.chapter.order,
          title: r.chapter.title,
        }
      : undefined;

  const result = {
    ...r.article,
    author: r.author,
    chapter: chapter,
  };
  return Value.Parse(ArticleDetail, result);
};
