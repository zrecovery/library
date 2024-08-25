import { beforeEach, describe, expect, it } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { resetDatabase } from "prisma/seed";
import { PersonBasePrismaRepository } from "./person.repository";
import type { Person } from "model/domain";
import type { PaginatedResponse, Query } from "model/schema";
import { peopleMock } from "mock/data";

beforeEach(async () => {
	await resetDatabase();
});
const client = new PrismaClient();
const authorTestRepository = new PersonBasePrismaRepository(client);

describe("Person Repository", () => {
	it("读取单个person", async () => {
		const id = 1;
		const result = await authorTestRepository.find({ id });

		const expectedAuthor: Required<Person> = peopleMock[id - 1];
		expect(result).toEqual(expectedAuthor);
	});

	it("读取person列表", async () => {
		const pagination: Query = { size: 10, page: 1 };
		const result = await authorTestRepository.findMany(pagination);
		const expectedArticle: PaginatedResponse<Required<Person>[]> = {
			detail: peopleMock,
			pagination: {
				items: 3,
				pages: 1,
				size: 10,
				current: 1,
			},
		};

		expect(result).toEqual(expectedArticle);
	});
});
