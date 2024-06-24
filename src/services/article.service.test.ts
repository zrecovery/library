import { beforeEach, expect, test } from "bun:test";
import { articleService } from "@src/application/ioc.service";
import {
	articlesMock,
	authorsMock,
	chaptersMock,
	seriesMock,
} from "@src/data.mock";
import type {
	IArticleResponse,
	IArticlesResponse,
} from "@src/interfaces/response.interface";
import { resetDatabase } from "prisma/seed";

beforeEach(async () => {
	await resetDatabase();
});

test("读取单个文章", async () => {
	const input = { id: 1 };
	const result = await articleService.findById(input.id);
	const expected: IArticleResponse = {
		detail: {
			...articlesMock.filter((a) => a.id === input.id)[0],
			series: seriesMock[0],
			authors: authorsMock.slice(0, 1),
			order: chaptersMock.filter((c) => c.article_id === input.id)[0].order,
		},
	};
	expect(expected).toEqual(result);
});

test("读取文章列表", async () => {
	const result = await articleService.search({ size: 10, page: 1 });
	const expected: IArticlesResponse = {
		detail: articlesMock,
		pagination: {
			items: 4,
			current: 1,
			pages: 1,
			size: 10,
		},
	};
	expect(expected).toEqual(result);
});
