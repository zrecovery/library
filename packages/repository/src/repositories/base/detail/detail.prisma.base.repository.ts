import type { PrismaClient } from "@prisma/client";
import type { ArticleDetail } from "model/domain";
import type { DetailBaseRepository } from "src/repositories/bussiness/base.port";
import type { Query, PaginatedResponse } from "model/schema";
import { convertPageToOffset, convertPaginationDetail } from "pagination";
import {
	type ArticleDetailEntity,
	ArticleDetailEntityToModel,
} from "../article/article.entity";
import { ErrorType, StoreError } from "er/store.error";

export class DetailBasePrismaRepository implements DetailBaseRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}

	findMany = async (
		query?: Query & Partial<ArticleDetailEntity>,
	): Promise<PaginatedResponse<ArticleDetail[]>> => {
		const { page, size } = query || {};
		const { limit, offset } = convertPageToOffset({ page, size });
		const count = await this.#client.detail.count({
			select: { id: true },
		});

		const data = await this.#client.detail.findMany({
			take: limit,
			skip: offset,
		});
		const detail = data.map(ArticleDetailEntityToModel);
		return {
			detail,
			pagination: convertPaginationDetail(count.id, {
				limit: limit ?? 10,
				offset: offset ?? 0,
			}),
		};
	};

	find = async (query: { id: number }): Promise<ArticleDetail> => {
		const { id } = query;
		const articleDetail = await this.#client.detail.findUnique({
			where: query,
		});

		if (!articleDetail) {
			throw new StoreError(
				ErrorType.NotFound,
				`文章未找到：article id: ${query.id}`,
			);
		}

		return ArticleDetailEntityToModel(articleDetail);
	};
}
