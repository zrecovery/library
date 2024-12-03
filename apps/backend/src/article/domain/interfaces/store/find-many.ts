import type { ArticleListResponse } from "../../schema/list";
import type { ArticleQuery } from "../../schema/query";

export interface FindMany {
  findMany(query: ArticleQuery): Promise<ArticleListResponse>;
}