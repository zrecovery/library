import { PrismaClient } from "@prisma/client";
import { IArticleCreateInput, IArticleUpdateInput } from "@src/interfaces/article.interface";
import { Query } from "@src/interfaces/query";
import { PaginatedResponse } from "@src/interfaces/response.interface";
import { Article } from "@src/model";
import { beforeEach, describe, expect, it } from "bun:test";
import { ArticlePrismaRepository } from "./article.prisma.repository";

describe("ArticlePrismaRepository", () => {
  let repository: ArticlePrismaRepository;
  let client: PrismaClient;
  const created_at = new Date();
  const updated_at = new Date();

  beforeEach(() => {
    client = new PrismaClient();
    repository = new ArticlePrismaRepository(client);
  });

  describe("getById", () => {
    it("should return a article", async () => {
      
      const expectedArticle: Required<Article> = {
        id: 1,
        title: "article title",
        body: "article body",
        created_at,
        updated_at,
      };
      const result = await repository.getById(expectedArticle.id);

      expect(result).toEqual(expectedArticle);
    });

    
  });

  describe("create", () => {
    it("should create a article", async () => {
      const input: IArticleCreateInput = {
        title: "title",
        body: "body"
      };
      const expectedArticle: Required<Article> = {
        id: 1,
        ...input,
        created_at,
        updated_at,
      };

      const result = await repository.create(input);

      expect(result).toEqual(expectedArticle);
    });
  });

  describe("update", () => {
    it("should update a article", async () => {
      const id = 1;
      const input: IArticleUpdateInput = {
        title: "title1",
      };
      const expectedArticle: Required<Article> = {
        id,
        title: "title1",
        body: "body",
        created_at,
        updated_at,
      };

      const result = await repository.update(id, input);

      expect(result).toEqual(expectedArticle);
    });
  });

  describe("delete", () => {
    it("should delete a article", async () => {
      const id = 1;
      await repository.delete(id);

      expect(client.article.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe("list", () => {
    it("should return a paginated article list", async () => {
      const offset = 1;
      const size = 10;
      const query: Query = { size, page: Math.floor(offset / size) + 1 };
      const keywords = ["keyword"];
      const expectedPagination: PaginatedResponse<Required<Article>[]> = {
        pagination: {
          items: 1,
          pages: Math.floor(offset / size) + 1,
          size,
          current:1
        },
        detail: [
          {
            id: 1,
            title: "article title",
            body: "article body",
            created_at,
            updated_at
          },
        ],
      };


      const result = await repository.list({ ...query, keywords });

      expect(result).toEqual(expectedPagination);
    });
  });
});
