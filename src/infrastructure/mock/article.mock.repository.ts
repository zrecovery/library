import type { Article } from "@/core/article/model/article.model";
import type { ArticleRepository } from "@/core/article/repository/ArticleRepository";

export class ArticleMockRepository implements ArticleRepository {
  async getArticleById(id: number): Promise<Article> {
    const article: Article = {
      id,
      title: "测试标题",
      book: "测试系列",
      author: "测试作者",
      chapter_order: 1,
      body: "测试内容",
      love: false,
    };
    return article;
  }

  async getArticlesByAuthorId(
    authorId: number,
    limit: number,
    offset: number,
  ): Promise<Article[]> {
    return [
      {
        id: 1,
        title: "测试标题",
        book: "测试系列",
        author: `测试作者${authorId}`,
        chapter_order: 1,
        body: "测试内容",
        love: false,
      },
      {
        id: 2,
        title: "测试标题",
        book: "测试系列",
        author: `测试作者${authorId}`,
        chapter_order: 1,
        body: "测试内容",
        love: false,
      },
    ];
  }

  async getArticles(limit: number, offset: number): Promise<Article[]> {
    return [
      {
        id: 1,
        title: "测试标题",
        book: "测试系列",
        author: "测试作者",
        chapter_order: 1,
        body: "测试内容",
        love: false,
      },
      {
        id: 2,
        title: "测试标题",
        book: "测试系列",
        author: "测试作者",
        chapter_order: 1,
        body: "测试内容",
        love: false,
      },
    ];
  }

  async createArticle(article: Article): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async updateArticle(article: Article): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async deleteArticle(id: number): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async searchArticles(
    query: Query,
    limit: number,
    offset: number,
  ): Promise<Article[]> {
    return [
      {
        id: 1,
        title: "测试标题",
        book: "测试系列",
        author: "测试作者",
        chapter_order: 1,
        body: "测试内容",
        love: false,
      },
      {
        id: 2,
        title: "测试标题",
        book: "测试系列",
        author: "测试作者",
        chapter_order: 1,
        body: "测试内容",
        love: false,
      },
    ];
  }
}
