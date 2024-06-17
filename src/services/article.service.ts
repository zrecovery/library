import type {
	IArticleCreateInput,
	IArticleUpdateInput,
} from "@src/interfaces/article.interface";
import type {
	IAuthorCreateInput,
	IAuthorUpdateInput,
} from "@src/interfaces/author.interface";
import { Creatable, Updatable } from "@src/interfaces/common.interface";
import type { Query } from "@src/interfaces/query";
import type { IArticleResponse } from "@src/interfaces/response.interface";
import type { ISeriesCreateInput } from "@src/interfaces/series.interface";
import type {
	Article,
	ArticleAuthorRelationship,
	Author,
	Chapter,
	Series,
} from "@src/model";
import { ArticleRepository } from "@src/repositories/article.repository.port";
import {
	AuthorRepository,
	ArticleAuthorRelationshipRepository,
} from "@src/repositories/author.repository.port";
import { BaseRepository } from "@src/repositories/base.repository.port";
import {
	SeriesRepository,
	ChapterRepository,
} from "@src/repositories/series.repository.port";

interface Repositories {
	articleRepository: ArticleRepository;
	authorRepository: AuthorRepository;
	authorArticleRepository: ArticleAuthorRelationshipRepository;
	seriesRepository: SeriesRepository;
	chapterRepository: ChapterRepository;
}

export class ArticleService {
	#repositories: Repositories;

	constructor(repositories: Repositories) {
		this.#repositories = repositories;
	}

	getAuthorsByArticleId = (id: number) =>
		this.#repositories.authorArticleRepository
			.list({
				article_id: id,
				size: -1,
			})
			.then((ar) => ar.detail)
			.then((authors) => authors.map((author) => author.id))
			.then((author_ids) =>
				Promise.all(
					author_ids.map((id) =>
						this.#repositories.authorRepository.getById(id),
					),
				),
			);

	getSeriesByArticleId = (id: number) =>
		this.#repositories.chapterRepository
			.list({
				article_id: id,
				size: 1,
			})
			.then((chapters) => chapters.detail)
			.then((chapters) =>
				Promise.all([
					chapters[0],
					this.#repositories.seriesRepository.getById(chapters[0].series_id),
				]),
			);

	search = (query: Query) => this.#repositories.articleRepository.list(query);

	delete = (id: number) => this.#repositories.articleRepository.delete(id);

	findById = async (id: number): Promise<IArticleResponse> => {
		const article = await this.#repositories.articleRepository.getById(id);
		const authors = await this.getAuthorsByArticleId(article.id);

		const [chapter, series] = await this.getSeriesByArticleId(article.id);

		const result = {
			detail: { ...article, authors, series, order: chapter.order },
		};
		return result;
	};

	getAuthorOrCreate = (author: IAuthorCreateInput) =>
		this.#repositories.authorRepository
			.list({
				name: author.name,
				size: 1,
			})
			.then((list) => {
				if (list.pagination.items === 1) {
					return list.detail[0];
				} else {
					return this.#repositories.authorRepository.create(author);
				}
			});

	createArticle = async (
		article: IArticleCreateInput,
		authors?: IAuthorCreateInput[],
		chapter?: { series: ISeriesCreateInput; order: number },
	): Promise<Article> => {
		// 1、创建文章
		const articleCreated =
			await this.#repositories.articleRepository.create(article);
		// 2、创建并关联作者
		const authorsCreated = authors
			? await Promise.all(authors.map(this.getAuthorOrCreate))
			: undefined;

		// 批量创建关系记录
		const articleRelation = authorsCreated
			? await Promise.all(
					authorsCreated.map((a) =>
						this.#repositories.authorArticleRepository.create({
							author_id: a.id,
							article_id: articleCreated.id,
						}),
					),
				)
			: undefined;

		// 3、创建并关联章节
		const findSeries = (chapter: {
			series: ISeriesCreateInput;
			order: number;
		}) =>
			this.#repositories.seriesRepository.list({
				title: chapter.series.title,
			});
		const findSeriesOrCreate = (series: ISeriesCreateInput) =>
			this.#repositories.seriesRepository
				.list({ title: series.title, size: 1 })
				.then((s) => {
					if (s.pagination.items === 1) {
						return s.detail[0];
					} else {
						return this.#repositories.seriesRepository.create(series);
					}
				});
		if (chapter) {
			const series = await findSeriesOrCreate(chapter.series);

			// 创建章节
			const chapterCreated = await this.#repositories.chapterRepository.create({
				article_id: articleCreated.id,
				series_id: series.id,
				order: chapter.order,
			});
		}

		return articleCreated;
	};
	/*
  //m: main, e: extract, r: relation
  (id,data:{m,e,r})=> pipe(
  (find(E,e.id)!==null?result=>E.entity:create),
  (find(R.id))!==null?update:create)
  )
  */
	updateArticle = async (
		id: number,
		changes: {
			article?: IArticleUpdateInput;
			author?: IAuthorUpdateInput;
			chapter?: { series?: ISeriesCreateInput; order?: number };
		},
	) => {
		if (changes.article) {
			await this.#repositories.articleRepository.update(id, changes.article);
		}

		if (changes.chapter) {
			if (changes.chapter.series) {
				const result = await this.#repositories.seriesRepository.list({
					size: 1,
					title: changes.chapter.series.title,
				});

				const series =
					result.pagination.items === 1
						? result.detail[0]
						: await this.#repositories.seriesRepository.create(
								changes.chapter.series,
							);

				const chapterQueried = await this.#repositories.chapterRepository.list({
					size: 1,
					article_id: id,
				});

				chapterQueried.pagination.items >= 1
					? chapterQueried.detail[1]
					: await this.#repositories.chapterRepository.create({
							article_id: id,
							series_id: series.id,
							order: changes.chapter.order ?? 1,
						});
			} else if (changes.chapter.order) {
				const chapterQueried = await this.#repositories.chapterRepository.list({
					size: 1,
					article_id: id,
				});
				const chapter = chapterQueried.detail[1];
				await this.#repositories.chapterRepository.update(chapter.id, {
					order: chapter.order,
				});
			}
		}
	};
}

const tmp = async <
	T extends Author | Series,
	M extends ArticleAuthorRelationship | Chapter,
>(
	mainMode: { article_id: number },
	mainRepos: BaseRepository<T>,
	relationRepos: BaseRepository<M>,
	main?: Creatable<T>,
	relation?: Updatable<M>,
	m_id_key?: (i: T) => object,
) => {
	const result = await mainRepos.list({
		size: 1,
		...main,
	});

	const mainQuried =
		result.pagination.items >= 1
			? result.detail[0]
			: await mainRepos.create(main!);

	const relationQueried = await relationRepos.list({
		size: 1,
		...mainMode,
	});

	const creatableEntity: Creatable<M> = {
		...mainMode,
		...m_id_key!(mainQuried),
		...relation,
	};

	relationQueried.pagination.items >= 1
		? relationQueried.detail[1]
		: await relationRepos.create(creatableEntity);
};
