import type { ArticleListResponse } from "@articles/domain/types/list";
import type { ArticleQuery } from "@articles/domain/types/query";

export interface Lister {
  findMany(query: ArticleQuery): Promise<ArticleListResponse>;
}
