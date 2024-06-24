import type { Query } from "@src/interfaces/query";
import type {
	ISeriesDetail,
	PaginatedResponse,
} from "@src/interfaces/response.interface";
import type { Series } from "@src/model";
import type { ArticleRepository } from "@src/repositories/article.repository.port";
import type {
	ArticleAuthorRelationshipRepository,
	AuthorRepository,
} from "@src/repositories/author.repository.port";
import type {
	ChapterRepository,
	SeriesRepository,
} from "@src/repositories/series.repository.port";

export class SeriesService {
	#articleRepository: ArticleRepository;
	#authorRepository: AuthorRepository;
	#seriesRepository: SeriesRepository;
	#chapterRepository: ChapterRepository;
	#authorArticleRepository: ArticleAuthorRelationshipRepository;

	constructor(
		articleRepository: ArticleRepository,
		authorRepository: AuthorRepository,
		authorArticleRepository: ArticleAuthorRelationshipRepository,
		seriesRepository: SeriesRepository,
		chapterRepository: ChapterRepository,
	) {
		this.#articleRepository = articleRepository;
		this.#authorRepository = authorRepository;
		this.#seriesRepository = seriesRepository;
		this.#chapterRepository = chapterRepository;
		this.#authorArticleRepository = authorArticleRepository;
	}

	list = async (
		query: Query,
	): Promise<PaginatedResponse<Required<Series>[]>> => {
		const series = await this.#seriesRepository.list(query);

		return series;
	};

	findById = async (id: number): Promise<ISeriesDetail> => {
		const series = await this.#seriesRepository.getById(id);
		const chapters = await this.#chapterRepository.list({ series_id: id });
		const articles = await Promise.all(
			chapters.detail.map(async (chapter) => {
				const article = (
					await this.#articleRepository.list({ chapter_id: chapter.id })
				).detail[0];
				return { order: chapter.order, ...article };
			}),
		);
		const authors = await Promise.all(
			(
				await Promise.all(
					articles.map(async (article) => {
						const authors = await this.#authorArticleRepository.list({
							article_id: article.id,
							size: -1,
						});
						return authors.detail;
					}),
				)
			)
				.flat()
				.map(async (authors_articles) => {
					return await this.#authorRepository.getById(
						authors_articles.author_id,
					);
				}),
		);
		return { ...series, articles, authors };
	};
}
