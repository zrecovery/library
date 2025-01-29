import { treaty } from "@elysiajs/eden";
import { ArticleCreate } from "backend";
import type { Server } from "web-api";
const repository = treaty<Server>("localhost:3001");

enum RepositoryStatusType {
  Success = "success",
  Void = "created",
  NotFound = "Not Found",
  Other = "Other",
}

interface CreatedSchema {
  chapter?: {
    title: string;
    order: number;
  };
  title: string;
  body: string;
  author: {
    name: string;
  };
}

class RepositoryError extends Error {
  constructor(message: string, type: RepositoryStatusType, raw?: Error) {
    super(message);
    console.error(`${type}: ${message}. ${raw ? `Raw: ${raw}` : ""}`);
  }
}

class ArticleRepository {
  async list(query: { page: number; size: number; keyword?: string }) {
    const q: { page: number; size: number; keyword?: string } =
      query.keyword === ""
        ? {
            page: query.page,
            size: query.size,
          }
        : {
            page: query.page,
            size: query.size,
            keyword: query.keyword,
          };

    const { data, error } = await repository.api.articles.index.get({
      query: q,
    });
    return data;
  }

  async detail(id: number) {
    const { data, error, status } = await repository.api
      .articles({ id: id })
      .get();

    return data;
  }

  async create(data: CreatedSchema) {
    const response = await repository.api.articles.index.post(data);
    this.#checkStatus(response.status);
  }

  async remove(id: number) {
    const { data, error, status } = await repository.api
      .articles({ id: id })
      .delete();
    return status;
  }

  #checkStatus(status: number) {
    switch (status) {
      case 200:
        return RepositoryStatusType.Success;
      case 201:
        return RepositoryStatusType.Void;
      case 404:
        throw new RepositoryError("未找到", RepositoryStatusType.NotFound);
      default:
        throw new RepositoryError(
          `未知错误:  状态码: ${status}`,
          RepositoryStatusType.Other,
        );
    }
  }
}

export const articleRepository = new ArticleRepository();
