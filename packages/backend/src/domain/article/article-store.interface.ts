import type { ArticleQuery, ArticleList, Id, ArticleDetail, ArticleCreate, ArticleUpdate } from "../model";

export interface ArticleStore {
  findMany(query: ArticleQuery): Promise<ArticleList>;
  find(id: Id): Promise<ArticleDetail | null>;
  create(date: ArticleCreate): Promise<void>;
  update(id: Id, data: ArticleUpdate): Promise<void>;
  remove(id: Id): Promise<void>;
}