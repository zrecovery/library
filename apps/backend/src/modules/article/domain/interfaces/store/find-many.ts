import type { ArticleListResponse } from "@article/domain/types/list";
import type { ArticleQuery } from "@article/domain/types/query";

export interface FindMany {
  findMany(query: ArticleQuery): Promise<ArticleListResponse>;
}
