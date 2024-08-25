import type { PrismaClient } from "@prisma/client";
import { ArticleDetailEntityToModel } from "../../base/article/article.entity";
import { findOrCreate, type ModelToType } from "../../base/base.repository";
import { StoreError, ErrorType } from "../../../../../er/store.error";
import type {
	ArticleCreated,
	ArticleDetail,
	ArticleUpdated,
} from "model/domain";
import type { Creatable } from "model/protocol";
import type { BasePrismaRepos } from "../../base/base";
import { convertPaginationDetail } from "pagination";
import type { ArticleRepository } from "domain/repository.port";

export class ArticlePrismaRepository implements ArticleRepository {
	readonly #client: PrismaClient;
	readonly #base: BasePrismaRepos;
	readonly #findOrCreate: <M extends Exclude<keyof BasePrismaRepos, "article">>(
		model: M,
		data: Creatable<ModelToType<M>>,
	) => Promise<number>;
	constructor(client: PrismaClient, base: BasePrismaRepos) {
		this.#client = client;
		this.#base = base;
		this.#findOrCreate = findOrCreate(base);
	}
	delete = async (id: number): Promise<void> => {
		await this.#client.article.delete({ where: { id } });
	};

	find = (query: { id: number }): Promise<ArticleDetail> => {
		return this.#base.article.find(query);
	};

	findMany = async ({
		offset,
		limit,
		keyword,
	}: { offset: number; limit: number; keyword?: string }) => {
		const where = {
			body: {
				contains: keyword,
			},
		};
		const count = await this.#client.detail.count({
			select: { id: true },
			where,
		});

		const result = await this.#client.detail.findMany({
			where,
			skip: offset,
			take: limit,
		});

		const detail = result.map(ArticleDetailEntityToModel);
		const pagination = convertPaginationDetail(count.id, {
			limit,
			offset,
		});
		return {
			detail,
			pagination,
		};
	};

	// Todo 需要优化创建文章的逻辑
	// 创建文件时，同时可能需要创建作者和分类
	// 作者和分类可能已经存在，无需再次创建
	// 也可能不存在，需要创建
	// 然后创建关系

	create = async ({ title, body, author, chapter }: ArticleCreated) => {
		const article = await this.#client.article.create({
			data: {
				title,
				body,
			},
		});

		if (author) {
			const author_id = await this.#findOrCreate("author", {
				name: author.name,
			});
			await this.#base.author.create({
				article_id: article.id,
				person_id: author_id,
			});
		}

		if (chapter) {
			const series_id = await this.#findOrCreate("series", {
				title: chapter.title,
			});
			await this.#base.chapter.create({
				article_id: article.id,
				series_id,
				order: chapter.order,
			});
		}

		return article;
	};

	// Todo 需要优化文章修改的逻辑
	// 修改文章时，同时可能新增作者和分类的关系
	// 作者和分类可能已经存在，无需再次创建
	// 也可能不存在，需要创建
	// 然后判断是否已有关系，有关系则更新，无关系则创建
	update = async (id: number, data: ArticleUpdated) => {
		const { title, body, author, chapter } = data;
		const article = await this.#client.detail.findFirst({ where: { id } });
		if (!article) {
			throw new StoreError(ErrorType.NotFound, `文章未找到：article id: ${id}`);
		}

		await this.#client.article.update({
			where: { id },
			data: { title, body },
		});

		if (chapter) {
			if (chapter.title) {
				const series_id = await this.#findOrCreate("series", {
					title: chapter.title,
				});
			}
			if (chapter.order) {
				await this.#client.chapter.update({
					data: {
						order: chapter.order,
					},
					where: {
						article_id: id,
					},
				});
			}
		}

		if (author) {
			const authorId = await this.#findOrCreate("author", {
				name: author.name,
			});
			if (article.author_id) {
				await this.#client.articles_authors.update({
					data: { author_id: authorId },
					where: { article_id: id },
				});
			}
		}
	};
}
