import type {
  ArticleCreate,
  ArticleDetail,
  ArticleList,
  ArticleQuery,
  ArticleUpdate,
  Id,
} from "../model";

export interface ArticleStore {
  create(date: ArticleCreate): Promise<void>;
  findMany(query: ArticleQuery): Promise<ArticleList>;
  find(id: Id): Promise<ArticleDetail | null>;
  update(id: Id, data: ArticleUpdate): Promise<void>;
  remove(id: Id): Promise<void>;
}

export const createArticleService = (store: ArticleStore) => store;
