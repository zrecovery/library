import { beforeEach, describe, expect, it } from "bun:test";
import {
	articlesMock,
	authorsMock,
	chaptersMock,
	seriesMock,
} from "@src/data.mock";
import type {
	IArticleResponse,
	PaginatedResponse,
	Response,
} from "@src/interfaces/response.interface";
import type { Article, Author, Series } from "@src/model";
import Elysia from "elysia";
import { resetDatabase } from "prisma/seed";
import { ArticleController } from "./article.controller";

type ArticleDetailJson = {
	id: number;
	title: string;
	body: string;
	created_at: string;
	updated_at: string;
	authors?: Required<{
		id: number;
		name: string;
		created_at: string;
		updated_at: string;
	}>[];
	series?: Required<{
		id: number;
		title: string;
		created_at: string;
		updated_at: string;
	}>;
	order?: number;
};

type ArticleJson = {
	id: number;
	title: string;
	body: string;
	created_at: string;
	updated_at: string;
};
function convertDatesToString(
	obj: IArticleResponse,
): Response<ArticleDetailJson> {
	const authors = obj.detail.authors?.map((a) => {
		return {
			id: a.id,
			name: a.name,
			created_at: a.created_at.toISOString(),
			updated_at: a.updated_at.toISOString(),
		};
	});

	const series = obj.detail.series
		? {
				id: obj.detail.series.id,
				title: obj.detail.series.title,
				created_at: obj.detail.series.created_at.toISOString(),
				updated_at: obj.detail.series.updated_at.toISOString(),
			}
		: undefined;

	const newObj: Response<ArticleDetailJson> = {
		detail: {
			id: obj.detail.id,
			title: obj.detail.title,
			body: obj.detail.body,
			authors,
			series,
			order: obj.detail.order,
			created_at: obj.detail.created_at.toISOString(),
			updated_at: obj.detail.updated_at.toISOString(),
		},
	};

	return newObj;
}

function convertListDatesToString(
	obj: PaginatedResponse<Required<Article>[]>,
): PaginatedResponse<ArticleJson[]> {
	// 如果是对象，创建一个新的对象，并递归处理每个属性
	const articles = obj.detail.map((a) => {
		return {
			id: a.id,
			title: a.title,
			body: a.body,
			created_at: a.created_at.toISOString(),
			updated_at: a.updated_at.toISOString(),
		};
	});

	const newObj: PaginatedResponse<ArticleJson[]> = {
		pagination: obj.pagination,
		detail: articles,
	};
	return newObj;
}

const articlePageMock = {
	items: 4,
	pages: 1,
	current: 1,
	size: 10,
};

describe("Articles", () => {
	beforeEach(async () => {
		await resetDatabase();
	});
	const app = new Elysia();
	app.use(ArticleController);
	app.listen(3001);

	it("返回单个", async () => {
		const input = { id: 1 };
		const expected: IArticleResponse = {
			detail: {
				...articlesMock.filter((a) => a.id === input.id)[0],
				series: seriesMock[0],
				authors: authorsMock.slice(0, 1),
				order: chaptersMock.filter((c) => c.article_id === input.id)[0].order,
			},
		};

		const response = await app
			.handle(new Request("http://localhost:3001/articles/1"))
			.then(async (res) => await res.json());
		expect(response).toEqual(convertDatesToString(expected));
	});

	it("返回列表", async () => {
		const mockResponse = {
			detail: articlesMock,
			pagination: articlePageMock,
		};

		const response = await app
			.handle(new Request("http://localhost:3001/articles"))
			.then(async (res) => await res.json());

		expect(response).toEqual(convertListDatesToString(mockResponse));
	});
});
