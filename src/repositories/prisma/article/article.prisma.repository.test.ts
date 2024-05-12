import { beforeEach, describe, expect, it, mock } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { articlesMock, created_at, updated_at } from "@src/data.mock";
import { IArticleUpdateInput } from "@src/interfaces/article.interface";
import type { Creatable, Updatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { PaginatedResponse } from "@src/interfaces/response.interface";
import type { Article } from "@src/model";
import { resetDatabase } from "prisma/seed";
import { ArticlePrismaRepository } from "./article.prisma.repository";

describe("ArticlePrismaRepository", () => {
	const client = new PrismaClient();
	const repository = new ArticlePrismaRepository(client);

	beforeEach(async () => {
		await resetDatabase();
	});
	describe("getById", () => {
		it("should return a article", async () => {
			const expectedArticle: Required<Article> = articlesMock[0];
			const result = await repository.getById(expectedArticle.id);

			expect(result).toEqual(expectedArticle);
		});
	});

	describe("create", () => {
		it("should create a article", async () => {
			const input: Creatable<Article> = {
				title: "title",
				body: "body",
			};
			const expected: Required<Article> = {
				id: 1,
				title: "title",
				body: "body",
				created_at,
				updated_at,
			};

			const result = await repository.create(input);

			expect(result.title).toEqual(expected.title);
			expect(result.body).toEqual(expected.body);
		});
	});

	describe("update", () => {
		it("should update a article", async () => {
			const id = 1;
			const input: Updatable<Article> = {
				title: "title1",
			};
			const expectedArticle: Required<Article> = articlesMock[0];
			expectedArticle.title = input.title ?? "title1";

			const result = await repository.update(id, input);

			expect(result).toEqual(expectedArticle);
		});
	});

	describe("delete", () => {
		it("should delete a article", async () => {
			const id = 1;
			const repositoryDelete = mock(async (id) => await repository.delete(id));
			await repositoryDelete(id);
			expect(repositoryDelete).toHaveBeenCalled();
			expect(repositoryDelete).toHaveBeenCalledWith(id);
		});
	});

	describe("list", () => {
		it("should return a paginated article list", async () => {
			const query: Query = { size: 10, page: 1 };
			const expectedPagination: PaginatedResponse<Required<Article>[]> = {
				pagination: {
					items: 4,
					pages: 1,
					size: 10,
					current: 1,
				},
				detail: articlesMock,
			};

			const result = await repository.list({ ...query });

			expect(result).toEqual(expectedPagination);
		});
	});
});
