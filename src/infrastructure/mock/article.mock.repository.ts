import type { Article } from "@/core/article/article.model";
import type {
  ArticleRepository,
  Query,
} from "@/core/article/article.repository";
import { Pagination } from "@/core/schema/pagination.schema";
import { QueryResult } from "@/core/schema/query-result.schema";

export const articlesMock: Article[] = [
  {
    id: 1,
    title: "测试标题",
    book: "测试系列",
    author: "测试作者",
    order: 1,
    body: "测试内容",
    love: false,
    author_id: 1,
    book_id: 1,
  },
  {
    id: 2,
    title: "测试标题",
    book: "测试系列",
    author: "测试作者",
    order: 1,
    body: "测试内容",
    love: false,
    author_id: 1,
    book_id: 2,
  },
];

export const articlePageMock = {
  page: 1,
  size: 10,
  total: 1,
};

export class ArticleMockRepository implements ArticleRepository {
  async getById(id: number): Promise<QueryResult<Article>> {
    const article = articlesMock.find((item) => item.id === id);
    return { detail: article };
  }

  async create(article: Article): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async update(article: Article): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async delete(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async search(
    query: Query,
    pagination: Pagination,
  ): Promise<QueryResult<Article[]>> {
    return {
      paging: {
        total: 1,
        size: 10,
        page: 1,
      },
      detail: articlesMock,
    };
  }
}
