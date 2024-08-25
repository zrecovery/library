// article.prisma.base.repository.test.ts
import { describe, beforeEach, expect, it } from "bun:test";
import { ArticleBasePrismaRepository } from "./article.prisma.base.repository";
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "prisma/seed";
import { articlesMock } from "mock/data";

describe("Article Base Repository", () => {
	const client = new PrismaClient();
	const repository = new ArticleBasePrismaRepository(client);

	beforeEach(async () => {
		await resetDatabase();
	});

	describe("find", () => {
		it("should find article by id", async () => {
			const id = 1;
			const result = await repository.find({ id });
			expect(result).toEqual(articlesMock[0]);
		});
	});
});
