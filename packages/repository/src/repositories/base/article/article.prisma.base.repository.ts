import type { PrismaClient } from "@prisma/client";
import { ArticleDetailEntityToModel } from "./article.entity";
import type { Article, ArticleDetail } from "model/domain";
import type { Creatable, Updatable } from "model/protocol";
import type { ArticleBaseRepository } from "src/repositories/bussiness/base.port";
import type { Query, PaginatedResponse } from "model/schema";
import { convertPageToOffset, convertPaginationDetail } from "pagination";
import { prismaError } from "src/error/store.prisma.error";

export class ArticleBasePrismaRepository implements ArticleBaseRepository {
	readonly #client: PrismaClient;

	constructor(client: PrismaClient) {
		this.#client = client;
	}

	update = (id: number, data: Updatable<Article>): Promise<Required<Article>> =>
		this.#client.article.update({ where: { id }, data });

	findMany = async (
		query?: Query,
	): Promise<PaginatedResponse<Required<Article>[]>> => {
		const { page, size, keyword } = query || {};
		const count = await this.#client.article.count({ select: { id: true } });
		const { limit, offset } = convertPageToOffset({ page, size });
		const data = await this.#client.article.findMany({
			where: {
				body: { contains: keyword },
			},
			take: limit,
			skip: offset,
		});
		return {
			detail: data,
			pagination: convertPaginationDetail(count.id, {
				limit: limit ?? 10,
				offset: offset ?? 0,
			}),
		};
	};

	create = async (data: Creatable<Article>) =>
		this.#client.article.create({ data });

	find = async (query: { id: number }): Promise<ArticleDetail> => {
		const { id } = query;
		try {
			const article = await this.#client.article.findUniqueOrThrow({
				where: query,
			});
			return article;
		} catch (error) {
			throw prismaError(error);
		}
	};

	remove = async (id: number) => {
		try {
			await this.#client.article.delete({ where: { id } });
		} catch (error) {
			prismaError(error);
		}
	};
}
