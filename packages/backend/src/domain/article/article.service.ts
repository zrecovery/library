import type {
  ArticleDetail,
  ArticleList,
  CreateArticle,
  Id,
  Pagination,
  UpdateArticle,
} from "../model";

export interface ArticleStore {
  create(date: CreateArticle): Promise<void>;
  findMany(query: Pagination & { keyword?: string }): Promise<ArticleList>;
  find(id: Id): Promise<ArticleDetail>;
  update(id: Id, data: UpdateArticle): Promise<void>;
  remove(id: Id): Promise<void>;
}

export const createArticleService = (store: ArticleStore) => store;
